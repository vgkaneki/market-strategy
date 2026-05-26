import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ReplayService } from "../replay/ReplayService.js";
import { ReplayPlaybackService } from "../replay/ReplayPlaybackService.js";
import { ReplayOverlayService } from "../replay/ReplayOverlayService.js";

const CreateReplaySchema = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]),
  symbol: z.string().min(2).max(30),
  timeframe: z.string().min(1).max(10),
  startTs: z.string().datetime(),
  endTs: z.string().datetime(),
  name: z.string().max(120).optional(),
  userId: z.string().optional()
});

const CandleReplayQuery = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]),
  symbol: z.string().min(2).max(30),
  interval: z.string().min(1).max(10),
  startTs: z.string().datetime(),
  endTs: z.string().datetime(),
  limit: z.coerce.number().min(1).max(10000).default(5000)
});

const ReplayFrameQuery = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"),
  symbol: z.string().min(2).max(30).default("BTC-USD"),
  interval: z.string().min(1).max(10).default("1m"),
  cursor: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(2000).default(200),
  startTs: z.string().datetime().optional(),
  endTs: z.string().datetime().optional()
});

const OverlayQuery = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]).default("hyperliquid"),
  symbol: z.string().min(2).max(30).default("BTC-USD"),
  interval: z.string().min(1).max(10).default("1m"),
  lookback: z.coerce.number().min(50).max(10000).default(1000),
  engineIds: z.string().optional()
});

export async function replayRoutes(app: FastifyInstance) {
  const replay = new ReplayService();
  const playback = new ReplayPlaybackService();
  const overlays = new ReplayOverlayService();

  app.post("/v1/replay/sessions", async (req, reply) => {
    const body = CreateReplaySchema.parse(req.body);
    const session = await replay.createSession(body);
    reply.code(201);
    return session;
  });

  app.get("/v1/replay/candles", async (req) => {
    const q = CandleReplayQuery.parse(req.query);
    const candles = await replay.getCandles(q.exchange, q.symbol, q.interval, q.startTs, q.endTs, q.limit);
    return { candles };
  });

  app.get("/v1/replay/frames", async (req) => {
    const q = ReplayFrameQuery.parse(req.query);
    return playback.getFrames(q);
  });

  app.get("/v1/replay/overlays", async (req) => {
    const q = OverlayQuery.parse(req.query);
    const engineIds = q.engineIds?.split(",").map((v) => v.trim()).filter(Boolean);
    return {
      overlays: await overlays.generate({ ...q, engineIds })
    };
  });
}
