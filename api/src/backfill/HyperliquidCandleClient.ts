import { config } from "../config.js";
import { toCanonicalSymbol, toVenueSymbol } from "../market/symbols.js";
import { assertHyperliquidInterval } from "./intervals.js";
import type { HistoricalCandle } from "./types.js";

type HyperliquidCandle = {
  T?: number;
  t?: number;
  s?: string;
  i?: string;
  o: string;
  h: string;
  l: string;
  c: string;
  v: string;
};

export class HyperliquidCandleClient {
  async fetchCandles(input: {
    symbol: string;
    interval: string;
    startMs: number;
    endMs: number;
  }): Promise<HistoricalCandle[]> {
    assertHyperliquidInterval(input.interval);
    const coin = toVenueSymbol("hyperliquid", input.symbol);

    const res = await fetch(config.HYPERLIQUID_INFO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "candleSnapshot",
        req: {
          coin,
          interval: input.interval,
          startTime: input.startMs,
          endTime: input.endMs
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Hyperliquid candleSnapshot failed: ${res.status} ${await res.text()}`);
    }

    const rows = await res.json() as HyperliquidCandle[];
    if (!Array.isArray(rows)) return [];

    return rows.map((row) => ({
      exchange: "hyperliquid",
      symbol: toCanonicalSymbol("hyperliquid", coin),
      venueSymbol: coin,
      interval: input.interval,
      ts: Number(row.t ?? row.T ?? input.startMs),
      open: String(row.o),
      high: String(row.h),
      low: String(row.l),
      close: String(row.c),
      volume: String(row.v ?? "0"),
      source: "hyperliquid:candleSnapshot"
    }));
  }
}
