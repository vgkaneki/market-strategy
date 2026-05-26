import { prisma } from "../db.js";
import { config } from "../config.js";
import { JwtService } from "./JwtService.js";
import { PasswordHasher } from "./PasswordHasher.js";
import type { AuthUser } from "./types.js";

export class AuthService {
  private readonly passwords = new PasswordHasher();
  private readonly jwt = new JwtService();

  async register(input: { email: string; password: string; ip?: string; userAgent?: string }) {
    const email = input.email.toLowerCase().trim();
    const passwordHash = await this.passwords.hash(input.password);

    // Phase 5 schema assumes User can be extended with passwordHash/role in migration.
    // This fallback keeps the route scaffold readable for handoff.
    const user = await (prisma as any).user.create({
      data: {
        email,
        passwordHash,
        role: "user"
      }
    });

    await this.audit("register", { userId: user.id, email, ip: input.ip });
    return this.createSession({ id: user.id, email: user.email, role: user.role ?? "user" }, input.ip, input.userAgent);
  }

  async login(input: { email: string; password: string; ip?: string; userAgent?: string }) {
    const email = input.email.toLowerCase().trim();
    const user = await (prisma as any).user.findUnique({ where: { email } });

    if (!user?.passwordHash) {
      await this.audit("login_failed", { email, ip: input.ip });
      throw new Error("Invalid credentials");
    }

    const ok = await this.passwords.verify(input.password, user.passwordHash);
    if (!ok) {
      await this.audit("login_failed", { userId: user.id, email, ip: input.ip });
      throw new Error("Invalid credentials");
    }

    await this.audit("login_success", { userId: user.id, email, ip: input.ip });
    return this.createSession({ id: user.id, email: user.email, role: user.role ?? "user" }, input.ip, input.userAgent);
  }

  async refresh(refreshToken: string, ip?: string, userAgent?: string) {
    const refreshHash = this.jwt.hashRefreshToken(refreshToken);
    const session = await (prisma as any).userSession.findFirst({
      where: {
        refreshHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    if (!session) throw new Error("Invalid refresh token");

    const user = await (prisma as any).user.findUnique({ where: { id: session.userId } });
    if (!user) throw new Error("User not found");

    return this.createSession({ id: user.id, email: user.email, role: user.role ?? "user" }, ip, userAgent);
  }

  async revoke(refreshToken: string) {
    const refreshHash = this.jwt.hashRefreshToken(refreshToken);
    await (prisma as any).userSession.updateMany({
      where: { refreshHash },
      data: { revokedAt: new Date() }
    });
  }

  private async createSession(user: AuthUser, ip?: string, userAgent?: string) {
    const tokens = this.jwt.issue(user);
    await (prisma as any).userSession.create({
      data: {
        userId: user.id,
        refreshHash: this.jwt.hashRefreshToken(tokens.refreshToken),
        ipAddress: ip,
        userAgent,
        expiresAt: new Date(Date.now() + config.AUTH_REFRESH_TOKEN_TTL_SECONDS * 1000)
      }
    });

    return { user, tokens };
  }

  private async audit(event: string, input: { userId?: string; email?: string; ip?: string }) {
    try {
      await (prisma as any).authAuditEvent.create({
        data: {
          userId: input.userId,
          email: input.email,
          event,
          ipAddress: input.ip
        }
      });
    } catch {
      // Audit route should not crash authentication during early migrations.
    }
  }
}
