import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";

const AlertSchema = z.object({ userId: z.string(), symbol: z.string(), condition: z.enum(["price_crosses_above", "price_crosses_below", "scanner_score_above"]), threshold: z.string() });

export async function alertRoutes(app: FastifyInstance) {
  app.post("/v1/alerts", async (req, reply) => {
    const body = AlertSchema.parse(req.body);
    const alert = await prisma.alertRule.create({ data: { userId: body.userId, symbol: body.symbol, condition: body.condition, threshold: body.threshold } });
    reply.code(201);
    return alert;
  });

  app.get("/v1/alerts", async (req) => {
    const userId = typeof (req.query as any)?.userId === "string" ? (req.query as any).userId : undefined;
    return { alerts: await prisma.alertRule.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: "desc" }, take: 500 }) };
  });

  app.get("/v1/alerts/events", async (req) => {
    const userId = typeof (req.query as any)?.userId === "string" ? (req.query as any).userId : undefined;
    return { events: await prisma.alertEvent.findMany({ where: userId ? { userId } : undefined, orderBy: { createdAt: "desc" }, take: 500 }) };
  });
}
