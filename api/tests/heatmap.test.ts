import { describe, expect, it } from "vitest";
import { HeatmapTileCache } from "../src/heatmap/HeatmapTileCache.js";

describe("HeatmapTileCache", () => {
  it("builds buckets from book events", () => {
    const cache = new HeatmapTileCache({} as any, { warn() {}, debug() {} } as any, 25);
    const tile = cache.buildTile({ type: "book_snapshot", exchange: "hyperliquid", symbol: "BTC-USD", venueSymbol: "BTC", ts: 1, receivedAt: 1, seq: 1, bids: [["65001", "2"], ["65010", "3"]], asks: [["65026", "4"]] });
    expect(tile.buckets.length).toBeGreaterThan(0);
    expect(tile.buckets[0]).toHaveProperty("intensity");
  });
});
