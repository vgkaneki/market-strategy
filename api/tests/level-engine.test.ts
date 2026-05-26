import { describe, expect, it } from "vitest";
import { LevelEngineRegistry } from "../src/levels/LevelEngineRegistry.js";
import type { Candle } from "../src/levels/types.js";

function candle(ts: number, open: number, high: number, low: number, close: number): Candle {
  return { ts, open: String(open), high: String(high), low: String(low), close: String(close), volume: "100" };
}

describe("LevelEngineRegistry", () => {
  it("lists built-in engines", () => {
    const registry = new LevelEngineRegistry();
    expect(registry.list().map((e) => e.id)).toContain("swing_pivot");
    expect(registry.list().map((e) => e.id)).toContain("liquidity_sweep");
  });

  it("generates chart levels", () => {
    const candles = Array.from({ length: 40 }, (_, i) =>
      candle(i, 100 + i, 105 + Math.sin(i) * 10, 95 - Math.sin(i) * 10, 100 + i)
    );

    const registry = new LevelEngineRegistry();
    const levels = registry.generateAll({ symbol: "BTC-USD", timeframe: "1m", candles });

    expect(Array.isArray(levels)).toBe(true);
    expect(levels.every((l) => l.price)).toBe(true);
  });
});
