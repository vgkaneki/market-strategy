import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../db.js";
import type { NormalizedMarketEvent } from "../market/types.js";

type RuntimeAlertRule = {
  id: string;
  userId: string;
  symbol: string;
  condition: string;
  threshold: string;
  enabled: boolean;
  lastTriggeredAt?: number;
  lastSeenPrice?: number;
};

export interface RuntimeAlertEvent {
  type: "alert_event";
  userId: string;
  alertRuleId: string;
  symbol: string;
  condition: string;
  triggerPrice: string;
  message: string;
  ts: number;
}

export class AlertWorker {
  private rules = new Map<string, RuntimeAlertRule>();
  private timer?: NodeJS.Timeout;

  constructor(private readonly logger: FastifyBaseLogger, private readonly onAlert: (topic: string, alert: RuntimeAlertEvent) => void, private readonly cooldownMs = 60_000) {}

  start() { this.timer = setInterval(() => void this.refreshRules(), 30_000); void this.refreshRules(); }
  stop() { clearInterval(this.timer); }

  async refreshRules() {
    try {
      const rows = await prisma.alertRule.findMany({ where: { enabled: true }, take: 5000 });
      const next = new Map<string, RuntimeAlertRule>();
      for (const row of rows) {
        const existing = this.rules.get(row.id);
        next.set(row.id, { id: row.id, userId: row.userId, symbol: row.symbol, condition: row.condition, threshold: row.threshold.toString(), enabled: row.enabled, lastTriggeredAt: existing?.lastTriggeredAt, lastSeenPrice: existing?.lastSeenPrice });
      }
      this.rules = next;
    } catch (err) { this.logger.warn({ err }, "failed to refresh alert rules"); }
  }

  handle(event: NormalizedMarketEvent) {
    if (event.type !== "trade") return;
    const price = Number(event.price);
    if (!Number.isFinite(price)) return;
    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.symbol !== event.symbol) continue;
      const threshold = Number(rule.threshold);
      const prev = rule.lastSeenPrice;
      rule.lastSeenPrice = price;
      if (prev == null || !Number.isFinite(threshold)) continue;
      const crossedAbove = rule.condition === "price_crosses_above" && prev < threshold && price >= threshold;
      const crossedBelow = rule.condition === "price_crosses_below" && prev > threshold && price <= threshold;
      if (!crossedAbove && !crossedBelow) continue;
      const now = Date.now();
      if (rule.lastTriggeredAt && now - rule.lastTriggeredAt < this.cooldownMs) continue;
      rule.lastTriggeredAt = now;
      const alert: RuntimeAlertEvent = { type: "alert_event", userId: rule.userId, alertRuleId: rule.id, symbol: rule.symbol, condition: rule.condition, triggerPrice: event.price, message: `${rule.symbol} ${rule.condition.replaceAll("_", " ")} ${rule.threshold}`, ts: now };
      this.onAlert(`alerts:${rule.userId}`, alert);
      void this.storeAlert(alert);
    }
  }

  private async storeAlert(alert: RuntimeAlertEvent) {
    try { await prisma.alertEvent.create({ data: { alertRuleId: alert.alertRuleId, userId: alert.userId, symbol: alert.symbol, condition: alert.condition, triggerPrice: alert.triggerPrice, message: alert.message } }); }
    catch (err) { this.logger.warn({ err, alert }, "failed to store alert event"); }
  }
}
