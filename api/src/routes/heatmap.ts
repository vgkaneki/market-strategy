import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { HeatmapTileCache } from "../heatmap/HeatmapTileCache.js";
import { redis } from "../db.js";
import { config } from "../config.js";

const HeatmapQuery = z.object({ exchange: z.enum(["hyperliquid", "dydx"]), symbol: z.string().min(2).max(30) });

export async function heatmapRoutes(app: FastifyInstance) {
  const cache = new HeatmapTileCache(redis, app.log, config.HEATMAP_BUCKET_SIZE);
  app.get("/v1/heatmap/latest", async (req) => { const q = HeatmapQuery.parse(req.query); return { tile: await cache.getLatest(q.exchange, q.symbol) }; });
}
