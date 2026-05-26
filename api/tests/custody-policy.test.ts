import { describe, expect, it } from "vitest";
import { CustodyPolicyEngine } from "../src/custody/CustodyPolicyEngine.js";

describe("CustodyPolicyEngine", () => {
  it("defaults to disabled/dry-run safety", () => {
    const engine = new CustodyPolicyEngine();
    const policy = engine.getPolicy();
    expect(policy.privateKeysStored).toBe(false);
  });

  it("blocks unsupported assets", () => {
    const decision = new CustodyPolicyEngine().evaluate({
      requestedBy: "user",
      asset: "DOGE",
      amount: "1",
      destination: "0x0000000000000000000000000000000000000000",
      estimatedUsd: 100
    });
    expect(decision.allowed).toBe(false);
  });
});
