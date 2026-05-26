import { config } from "../config.js";
import { toCanonicalSymbol, toVenueSymbol } from "../market/symbols.js";
import { toDydxResolution } from "./intervals.js";
import type { HistoricalCandle } from "./types.js";

type DydxCandle = {
  startedAt?: string;
  updatedAt?: string;
  open: string;
  high: string;
  low: string;
  close: string;
  baseTokenVolume?: string;
  usdVolume?: string;
  volume?: string;
};

export class DydxCandleClient {
  async fetchCandles(input: {
    symbol: string;
    interval: string;
    startIso: string;
    endIso: string;
    limit?: number;
  }): Promise<HistoricalCandle[]> {
    const market = toVenueSymbol("dydx", input.symbol);
    const resolution = toDydxResolution(input.interval);

    const qs = new URLSearchParams({
      resolution,
      fromISO: input.startIso,
      toISO: input.endIso
    });

    if (input.limit) qs.set("limit", String(input.limit));

    const url = `${config.DYDX_INDEXER_URL}/v4/candles/perpetualMarkets/${encodeURIComponent(market)}?${qs}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`dYdX candles failed: ${res.status} ${await res.text()}`);
    }

    const body = await res.json() as { candles?: DydxCandle[] };
    const rows = Array.isArray(body.candles) ? body.candles : [];

    const normalized: HistoricalCandle[] = rows.map((row): HistoricalCandle => ({
      exchange: "dydx",
      symbol: toCanonicalSymbol("dydx", market),
      venueSymbol: market,
      interval: input.interval,
      ts: Date.parse(String(row.startedAt ?? row.updatedAt)),
      open: String(row.open),
      high: String(row.high),
      low: String(row.low),
      close: String(row.close),
      volume: String(row.baseTokenVolume ?? row.usdVolume ?? row.volume ?? "0"),
      source: "dydx:indexer:candles"
    })).filter((row) => Number.isFinite(row.ts));

    return normalized;
  }
}
