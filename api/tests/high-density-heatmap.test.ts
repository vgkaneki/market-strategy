import { describe, expect, it } from "vitest";
import { HighDensityHeatmapEngine } from "../src/heatmap/HighDensityHeatmapEngine.js";

describe("HighDensityHeatmapEngine", () => {
  it("builds normalized heatmap cells", () => {
    const engine = new HighDensityHeatmapEngine({
      bucketSize: 25,
      decayHalfLifeMs: 60_000,
      maxRows: 100,
      minVisibleIntensity: 0.01
    });

    const cells = engine.applyFrame({
      exchange: "hyperliquid",
      symbol: "BTC-USD",
      ts: 1,
      bids: [{ price: "65001", size: "10" }],
      asks: [{ price: "65050", size: "20" }]
    });

    expect(cells.length).toBeGreaterThan(0);
    expect(Math.max(...cells.map((c) => Math.max(c.bidIntensity, c.askIntensity)))).toBeLessThanOrEqual(1);
  });
});
