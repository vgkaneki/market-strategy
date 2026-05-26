import { describe, expect, it } from "vitest";
import { ValidationMetrics } from "../src/validation/ValidationMetrics.js";
import type { BacktestReport } from "../src/backtest/types.js";

describe("ValidationMetrics", () => {
  it("computes engine breakdown", () => {
    const report = {
      request: {
        exchange: "hyperliquid",
        symbol: "BTC-USD",
        interval: "1m",
        lookback: 100,
        reactionBars: 10,
        reactionBps: 25,
        maxDistanceBps: 5
      },
      summary: {
        candles: 100,
        levelsGenerated: 1,
        levelsTested: 1,
        touches: 2,
        wins: 1,
        losses: 1,
        timeouts: 0,
        reactionRate: 50,
        avgMfeBps: 10,
        avgMaeBps: 8
      },
      levels: [],
      trades: [
        { levelId: "1", engine: "swing_pivot", side: "support", price: "100", touchedAt: 1, result: "win", maxFavorableBps: 30, maxAdverseBps: 5, barsHeld: 2 },
        { levelId: "2", engine: "swing_pivot", side: "support", price: "90", touchedAt: 2, result: "loss", maxFavorableBps: 5, maxAdverseBps: 30, barsHeld: 2 }
      ]
    } satisfies BacktestReport;

    const metrics = new ValidationMetrics().compute(report);
    expect(metrics.reactionRate).toBe(50);
    expect(metrics.byEngine[0].engine).toBe("swing_pivot");
  });
});
