import type { FastifyRequest, FastifyReply } from "fastify";
import { JwtService } from "./JwtService.js";
import type { AuthUser, UserRole } from "./types.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const jwt = new JwtService();

export function requireAuth(roles?: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (!token) {
      reply.code(401);
      throw new Error("Unauthorized");
    }

    const user = jwt.verifyAccessToken(token);

    if (roles?.length && !roles.includes(user.role)) {
      reply.code(403);
      throw new Error("Forbidden");
    }

    req.user = user;
  };
}
