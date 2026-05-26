import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { OrderBookHistoryService } from "../orderbook-history/OrderBookHistoryService.js";

const Query = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"),
  symbol: z.string().min(2).max(30).default("BTC-USD"),
  startTs: z.string().datetime(),
  endTs: z.string().datetime(),
  limit: z.coerce.number().min(1).max(10000).default(1000)
});

export async function orderbookHistoryRoutes(app: FastifyInstance) {
  const service = new OrderBookHistoryService();

  app.get("/v1/orderbook-history/frames", async (req) => {
    const q = Query.parse(req.query);
    return {
      frames: await service.fromCapturedLive(q)
    };
  });
}
