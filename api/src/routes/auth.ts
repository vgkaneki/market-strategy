import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AuthService } from "../auth/AuthService.js";
import { requireAuth } from "../auth/requireAuth.js";

const Credentials = z.object({
  email: z.string().email(),
  password: z.string().min(12)
});

const RefreshBody = z.object({
  refreshToken: z.string().min(20)
});

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService();

  app.post("/v1/auth/register", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" } }
  }, async (req, reply) => {
    const body = Credentials.parse(req.body);
    const result = await service.register({
      ...body,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });
    reply.code(201);
    return result;
  });

  app.post("/v1/auth/login", {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } }
  }, async (req) => {
    const body = Credentials.parse(req.body);
    return service.login({
      ...body,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });
  });

  app.post("/v1/auth/refresh", async (req) => {
    const body = RefreshBody.parse(req.body);
    return service.refresh(body.refreshToken, req.ip, req.headers["user-agent"]);
  });

  app.post("/v1/auth/logout", async (req) => {
    const body = RefreshBody.parse(req.body);
    await service.revoke(body.refreshToken);
    return { ok: true };
  });

  app.get("/v1/auth/me", { preHandler: requireAuth() }, async (req) => ({
    user: req.user
  }));

  app.get("/v1/auth/admin-check", { preHandler: requireAuth(["admin"]) }, async () => ({
    ok: true,
    role: "admin"
  }));
}
