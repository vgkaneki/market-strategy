import { clickhouse } from "../clickhouse/client.js";
import type { HistoricalCandle } from "./types.js";

function dt(ms: number): string {
  return new Date(ms).toISOString().replace("Z", "");
}

export class CandleStore {
  async insertCandles(candles: HistoricalCandle[]) {
    if (candles.length === 0) return { inserted: 0 };

    await clickhouse.insert({
      table: "candles",
      format: "JSONEachRow",
      values: candles.map((candle) => ({
        ts: dt(candle.ts),
        exchange: candle.exchange,
        symbol: candle.symbol,
        interval: candle.interval,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        received_at: dt(Date.now())
      }))
    });

    return { inserted: candles.length };
  }
}
