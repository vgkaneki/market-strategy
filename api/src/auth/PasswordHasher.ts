import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);

export class PasswordHasher {
  async hash(password: string) {
    if (password.length < 12) {
      throw new Error("Password must be at least 12 characters");
    }

    const salt = randomBytes(16).toString("hex");
    const derived = await scrypt(password, salt, 64) as Buffer;
    return `scrypt:${salt}:${derived.toString("hex")}`;
  }

  async verify(password: string, stored: string) {
    const [scheme, salt, hash] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hash) return false;

    const derived = await scrypt(password, salt, 64) as Buffer;
    const expected = Buffer.from(hash, "hex");

    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  }
}
