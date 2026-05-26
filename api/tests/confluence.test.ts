import { describe, expect, it } from "vitest";
import { MultiTimeframeConfluenceService } from "../src/confluence/MultiTimeframeConfluenceService.js";
import type { Candle } from "../src/levels/types.js";

function candle(ts: number, price: number): Candle {
  return {
    ts,
    open: String(price),
    high: String(price + 10),
    low: String(price - 10),
    close: String(price),
    volume: "100"
  };
}

describe("MultiTimeframeConfluenceService", () => {
  it("returns a zones array", () => {
    const service = new MultiTimeframeConfluenceService(undefined, 50);
    const candles = Array.from({ length: 60 }, (_, i) => candle(i, 1000 + Math.sin(i / 3) * 100));
    const zones = service.run({
      symbol: "BTC-USD",
      candlesByTimeframe: {
        "1m": candles,
        "5m": candles
      }
    });

    expect(Array.isArray(zones)).toBe(true);
  });
});
