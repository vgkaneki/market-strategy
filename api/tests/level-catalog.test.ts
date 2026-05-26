import { describe, expect, it } from "vitest";
import { LevelEngineRegistry } from "../src/levels/LevelEngineRegistry.js";

describe("Complete level catalog", () => {
  it("registers expanded engine catalog", () => {
    const registry = new LevelEngineRegistry();
    const engines = registry.list().map((e) => e.id);
    expect(engines).toContain("equal_high_liquidity");
    expect(engines).toContain("fair_value_gap_mid");
    expect(engines).toContain("market_profile_poc");
    expect(engines).toContain("dom_bid_wall");
    expect(engines.length).toBeGreaterThan(15);
  });
});
