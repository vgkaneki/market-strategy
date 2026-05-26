import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

export async function registerSecurity(app: FastifyInstance) {
  await app.register(helmet);
  await app.register(cors, {
    origin: config.APP_ORIGIN,
    credentials: true
  });
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW,
    keyGenerator: (req) => {
      const user = req.headers["x-user-id"];
      return typeof user === "string" ? `user:${user}` : `ip:${req.ip}`;
    }
  });
}
