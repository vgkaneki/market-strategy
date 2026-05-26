import { describe, expect, it } from "vitest";
import { PasswordHasher } from "../src/auth/PasswordHasher.js";

describe("PasswordHasher", () => {
  it("hashes and verifies passwords", async () => {
    const hasher = new PasswordHasher();
    const hash = await hasher.hash("ThisIsAStrongPassword123!");
    expect(await hasher.verify("ThisIsAStrongPassword123!", hash)).toBe(true);
    expect(await hasher.verify("wrong-password", hash)).toBe(false);
  });
});
