import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { clickhouse } from "../clickhouse/client.js";

const CandleQuerySchema = z.object({ exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"), symbol: z.string().min(2).max(30), interval: z.string().default("1m"), limit: z.coerce.number().min(1).max(5000).default(500) });
const LatestBookQuerySchema = z.object({ exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"), symbol: z.string().min(2).max(30), depth: z.coerce.number().min(1).max(100).default(25) });

export async function marketRoutes(app: FastifyInstance) {
  app.get("/v1/candles", async (req) => {
    const q = CandleQuerySchema.parse(req.query);
    const result = await clickhouse.query({ query: `SELECT toUnixTimestamp64Milli(ts) AS ts, open, high, low, close, volume FROM candles WHERE exchange = {exchange:String} AND symbol = {symbol:String} AND interval = {interval:String} ORDER BY ts DESC LIMIT {limit:UInt32}`, format: "JSONEachRow", query_params: q });
    const rows = await result.json();
    return { exchange: q.exchange, symbol: q.symbol, interval: q.interval, candles: Array.isArray(rows) ? rows.reverse() : rows };
  });

  app.get("/v1/orderbook/latest", async (req) => {
    const q = LatestBookQuerySchema.parse(req.query);
    return { exchange: q.exchange, symbol: q.symbol, depth: q.depth, bids: [], asks: [], note: "Latest book cache route is reserved for Phase 3 persistent book snapshots." };
  });
}
