import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { DydxCandleClient } from "./DydxCandleClient.js";
import { HyperliquidCandleClient } from "./HyperliquidCandleClient.js";
import { CandleStore } from "./CandleStore.js";
import type { BackfillJob, BackfillRequest, HistoricalCandle } from "./types.js";

export class CandleBackfillService {
  private jobs = new Map<string, BackfillJob>();

  constructor(
    private readonly hyperliquid = new HyperliquidCandleClient(),
    private readonly dydx = new DydxCandleClient(),
    private readonly store = new CandleStore()
  ) {}

  listJobs() {
    return [...this.jobs.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  getJob(id: string) {
    return this.jobs.get(id) ?? null;
  }

  async run(request: BackfillRequest) {
    this.validate(request);

    const now = Date.now();
    const job: BackfillJob = {
      id: randomUUID(),
      request,
      status: "running",
      createdAt: now,
      updatedAt: now,
      candlesInserted: 0
    };

    this.jobs.set(job.id, job);

    try {
      const candles = await this.fetch(request);
      const result = await this.store.insertCandles(candles);
      job.status = "completed";
      job.candlesInserted = result.inserted;
      job.updatedAt = Date.now();
      return job;
    } catch (err) {
      job.status = "failed";
      job.error = err instanceof Error ? err.message : "Unknown backfill error";
      job.updatedAt = Date.now();
      return job;
    }
  }

  private validate(request: BackfillRequest) {
    const start = Date.parse(request.startTs);
    const end = Date.parse(request.endTs);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new Error("Invalid startTs/endTs");
    }

    if (end <= start) {
      throw new Error("endTs must be after startTs");
    }

    if (end - start > config.BACKFILL_MAX_RANGE_MS) {
      throw new Error(`Backfill range too large. Max ${config.BACKFILL_MAX_RANGE_MS}ms`);
    }
  }

  private async fetch(request: BackfillRequest): Promise<HistoricalCandle[]> {
    const startMs = Date.parse(request.startTs);
    const endMs = Date.parse(request.endTs);

    if (request.exchange === "hyperliquid") {
      return this.hyperliquid.fetchCandles({
        symbol: request.symbol,
        interval: request.interval,
        startMs,
        endMs
      });
    }

    return this.dydx.fetchCandles({
      symbol: request.symbol,
      interval: request.interval,
      startIso: request.startTs,
      endIso: request.endTs,
      limit: config.BACKFILL_BATCH_LIMIT
    });
  }
}
