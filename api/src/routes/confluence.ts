import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { clickhouse } from "../clickhouse/client.js";
import { config } from "../config.js";
import type { Candle } from "../levels/types.js";
import { MultiTimeframeConfluenceService } from "../confluence/MultiTimeframeConfluenceService.js";

const Query = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"),
  symbol: z.string().min(2).max(30).default("BTC-USD"),
  timeframes: z.string().default("1m,5m,15m,1h"),
  lookback: z.coerce.number().min(50).max(10000).default(1000),
  engineIds: z.string().optional()
});

async function loadCandles(exchange: string, symbol: string, interval: string, limit: number): Promise<Candle[]> {
  const result = await clickhouse.query({
    query: `
      SELECT
        toUnixTimestamp64Milli(ts) AS ts,
        toString(open) AS open,
        toString(high) AS high,
        toString(low) AS low,
        toString(close) AS close,
        toString(volume) AS volume
      FROM candles
      WHERE exchange = {exchange:String}
        AND symbol = {symbol:String}
        AND interval = {interval:String}
      ORDER BY ts DESC
      LIMIT {limit:UInt32}
    `,
    format: "JSONEachRow",
    query_params: { exchange, symbol, interval, limit }
  });

  const rows = await result.json<Candle>();
  return rows.map((row) => ({
    ts: Number(row.ts),
    open: String(row.open),
    high: String(row.high),
    low: String(row.low),
    close: String(row.close),
    volume: String(row.volume)
  })).reverse();
}

export async function confluenceRoutes(app: FastifyInstance) {
  app.get("/v1/confluence/run", async (req) => {
    const q = Query.parse(req.query);
    const timeframes = q.timeframes.split(",").map((v) => v.trim()).filter(Boolean);
    const engineIds = q.engineIds?.split(",").map((v) => v.trim()).filter(Boolean);

    const candlesByTimeframe: Record<string, Candle[]> = {};
    for (const timeframe of timeframes) {
      candlesByTimeframe[timeframe] = await loadCandles(q.exchange, q.symbol, timeframe, q.lookback);
    }

    const service = new MultiTimeframeConfluenceService(undefined, config.CONFLUENCE_DISTANCE_BPS);
    const zones = service.run({
      symbol: q.symbol,
      candlesByTimeframe,
      engineIds
    });

    return {
      exchange: q.exchange,
      symbol: q.symbol,
      timeframes,
      zones
    };
  });
}
