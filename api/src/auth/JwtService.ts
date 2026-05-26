import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { config } from "../config.js";
import type { AuthTokens, AuthUser } from "./types.js";

export class JwtService {
  signAccessToken(user: AuthUser): string {
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      config.AUTH_JWT_SECRET,
      { expiresIn: config.AUTH_ACCESS_TOKEN_TTL_SECONDS }
    );
  }

  verifyAccessToken(token: string): AuthUser {
    const decoded = jwt.verify(token, config.AUTH_JWT_SECRET) as jwt.JwtPayload;
    return {
      id: String(decoded.sub),
      email: String(decoded.email),
      role: String(decoded.role ?? "user") as AuthUser["role"]
    };
  }

  createRefreshToken() {
    return randomBytes(48).toString("base64url");
  }

  hashRefreshToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  issue(user: AuthUser): AuthTokens {
    const refreshToken = this.createRefreshToken();
    return {
      accessToken: this.signAccessToken(user),
      refreshToken,
      expiresIn: config.AUTH_ACCESS_TOKEN_TTL_SECONDS
    };
  }
}
