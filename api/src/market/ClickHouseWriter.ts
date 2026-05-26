import type { FastifyBaseLogger } from "fastify";
import type { NormalizedMarketEvent } from "./types.js";

/**
 * ClickHouse writer scaffold.
 *
 * This intentionally batches writes and tolerates downtime.
 * Replace fetch implementation with @clickhouse/client when ready.
 */
export class ClickHouseWriter {
  private queue: NormalizedMarketEvent[] = [];
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly flushEveryMs = 1000,
    private readonly maxBatch = 1000
  ) {}

  start() {
    this.timer = setInterval(() => void this.flush(), this.flushEveryMs);
  }

  stop() {
    clearInterval(this.timer);
  }

  enqueue(event: NormalizedMarketEvent) {
    this.queue.push(event);
    if (this.queue.length >= this.maxBatch) {
      void this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.maxBatch);

    // TODO:
    // 1. Split by event type.
    // 2. Insert trades into market_strategy.trades.
    // 3. Insert book snapshots/deltas into market_strategy.book_deltas.
    // 4. Insert candles into market_strategy.candles.
    this.logger.debug({ count: batch.length }, "clickhouse batch ready");
  }
}
