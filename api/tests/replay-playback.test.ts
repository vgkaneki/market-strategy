import { describe, expect, it } from "vitest";
import { ReplayPlaybackService } from "../src/replay/ReplayPlaybackService.js";

describe("ReplayPlaybackService", () => {
  it("sanitizes replay frame input", () => {
    const service = new ReplayPlaybackService();
    const q = service.sanitize({
      exchange: "hyperliquid",
      symbol: "BTC-USD",
      interval: "1m",
      cursor: -5,
      limit: 999999
    });

    expect(q.cursor).toBe(0);
    expect(q.limit).toBeGreaterThan(0);
    expect(q.limit).toBeLessThanOrEqual(1000);
  });
});
