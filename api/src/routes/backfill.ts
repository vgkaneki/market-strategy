import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { CandleBackfillService } from "../backfill/CandleBackfillService.js";

const BackfillSchema = z.object({
  exchange: z.enum(["hyperliquid", "dydx"]),
  symbol: z.string().min(2).max(30),
  interval: z.string().min(1).max(10),
  startTs: z.string().datetime(),
  endTs: z.string().datetime()
});

export async function backfillRoutes(app: FastifyInstance) {
  const service = new CandleBackfillService();

  app.get("/v1/backfill/status", async () => ({
    jobs: service.listJobs()
  }));

  app.get("/v1/backfill/status/:id", async (req, reply) => {
    const id = String((req.params as any).id);
    const job = service.getJob(id);
    if (!job) {
      reply.code(404);
      return { error: "job_not_found" };
    }
    return job;
  });

  app.post("/v1/backfill/run", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute"
      }
    }
  }, async (req, reply) => {
    const body = BackfillSchema.parse(req.body);
    const job = await service.run(body);
    reply.code(job.status === "failed" ? 500 : 201);
    return job;
  });
}
