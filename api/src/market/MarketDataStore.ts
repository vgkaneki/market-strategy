import type { FastifyBaseLogger } from "fastify";
import { clickhouse } from "../clickhouse/client.js";
import type { NormalizedMarketEvent } from "./types.js";

function dt(ms: number): string {
  return new Date(ms).toISOString().replace("Z", "");
}

/** Batched ClickHouse writer for normalized market events. */
export class MarketDataStore {
  private queue: NormalizedMarketEvent[] = [];
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly logger: FastifyBaseLogger,
    private readonly flushEveryMs = 1000,
    private readonly maxBatch = 5000,
    private readonly maxQueue = 100_000
  ) {}

  start() {
    this.timer = setInterval(() => void this.flush(), this.flushEveryMs);
  }

  stop() {
    clearInterval(this.timer);
  }

  enqueue(event: NormalizedMarketEvent) {
    if (this.queue.length >= this.maxQueue) {
      const dropped = this.queue.splice(0, Math.floor(this.maxQueue * 0.1));
      this.logger.warn({ dropped: dropped.length }, "market data queue overloaded; dropped oldest events");
    }
    this.queue.push(event);
    if (this.queue.length >= this.maxBatch) void this.flush();
  }

  async flush() {
    if (this.queue.length === 0) return;
    const batch = this.queue.splice(0, this.maxBatch);
    const trades: any[] = [];
    const books: any[] = [];
    const candles: any[] = [];

    for (const event of batch) {
      if (event.type === "trade") {
        trades.push({
          ts: dt(event.ts), exchange: event.exchange, symbol: event.symbol,
          trade_id: event.tradeId, side: event.side, price: event.price, size: event.size,
          received_at: dt(event.receivedAt)
        });
      }

      if (event.type === "book_delta" || event.type === "book_snapshot") {
        for (const [price, size] of event.bids) {
          books.push({ ts: dt(event.ts), exchange: event.exchange, symbol: event.symbol, seq: event.seq, side: "bid", price, size, action: event.type === "book_snapshot" ? "snapshot" : "delta", received_at: dt(event.receivedAt) });
        }
        for (const [price, size] of event.asks) {
          books.push({ ts: dt(event.ts), exchange: event.exchange, symbol: event.symbol, seq: event.seq, side: "ask", price, size, action: event.type === "book_snapshot" ? "snapshot" : "delta", received_at: dt(event.receivedAt) });
        }
      }

      if (event.type === "candle") {
        candles.push({
          ts: dt(event.ts), exchange: event.exchange, symbol: event.symbol, interval: event.interval,
          open: event.open, high: event.high, low: event.low, close: event.close,
          volume: event.volume, received_at: dt(event.receivedAt)
        });
      }
    }

    try {
      await Promise.all([
        this.insert("trades", trades),
        this.insert("book_deltas", books),
        this.insert("candles", candles)
      ]);
      this.logger.debug({ trades: trades.length, books: books.length, candles: candles.length }, "market data stored");
    } catch (err) {
      this.logger.error({ err, count: batch.length }, "failed to insert market data batch");
      this.queue.unshift(...batch.slice(-1000));
    }
  }

  private async insert(table: string, values: any[]) {
    if (values.length === 0) return;
    await clickhouse.insert({ table, format: "JSONEachRow", values });
  }
}
