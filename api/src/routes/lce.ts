import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { LceMarketDecisionService } from "../lce-sdk/LceMarketDecisionService.js";

const DecisionBody = z.object({
  symbol: z.string().min(1),
  timeframe: z.string().default("1m"),
  candles: z.array(z.any()).default([]),
  book: z.any().optional(),
  trades: z.array(z.any()).default([]),
  dataHealth: z.any().optional(),
  forwardProof: z.any().optional()
});

const LiveQuery = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"),
  symbol: z.string().min(2).max(30).default("BTC-USD"),
  interval: z.string().min(1).max(10).default("1m"),
  lookback: z.coerce.number().min(10).max(10000).default(1000)
});

const ValidateBody = z.object({
  symbol: z.string().min(1),
  timeframe: z.string().default("1m"),
  candles: z.array(z.any()).min(10),
  ratio: z.number().min(0.1).max(0.9).optional()
});

export async function lceRoutes(app: FastifyInstance) {
  const service = new LceMarketDecisionService();

  app.get("/v1/lce/status", async () => service.status());

  app.get("/v1/lce/engines", async () => service.engines());

  app.post("/v1/lce/decision", async (req) => {
    const body = DecisionBody.parse(req.body);
    return service.decideFromInputs(body);
  });

  app.get("/v1/lce/decision/live", async (req) => {
    const q = LiveQuery.parse(req.query);
    return service.decideFromStored(q);
  });

  app.post("/v1/lce/validate-forward", async (req) => {
    const body = ValidateBody.parse(req.body);
    return service.validateForward(body);
  });
}
