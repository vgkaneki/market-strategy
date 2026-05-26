import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { BacktestService } from "../backtest/BacktestService.js";
import { BacktestReportStore } from "../reports/BacktestReportStore.js";

const BacktestQuery = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"),
  symbol: z.string().min(2).max(30).default("BTC-USD"),
  interval: z.string().min(1).max(10).default("1m"),
  lookback: z.coerce.number().min(50).max(20000).default(1000),
  reactionBars: z.coerce.number().min(1).max(200).default(20),
  reactionBps: z.coerce.number().min(1).max(1000).default(25),
  maxDistanceBps: z.coerce.number().min(0).max(100).default(5),
  engineIds: z.string().optional(),
  persist: z.coerce.boolean().default(false)
});

export async function backtestRoutes(app: FastifyInstance) {
  const service = new BacktestService();
  const reports = new BacktestReportStore();

  app.get("/v1/backtest/engines", async () => ({
    engines: service.listEngines()
  }));

  app.get("/v1/backtest/run", async (req) => {
    const q = BacktestQuery.parse(req.query);
    const engineIds = q.engineIds
      ? q.engineIds.split(",").map((v) => v.trim()).filter(Boolean)
      : undefined;

    const report = await service.run({ ...q, engineIds });

    if (q.persist) {
      const stored = await reports.save(report as any);
      return { ...report, storedReportId: stored.id };
    }

    return report;
  });
}
