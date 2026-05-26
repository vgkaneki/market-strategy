import { describe, expect, it } from "vitest";
import { ReversalBacktester } from "../src/backtest/ReversalBacktester.js";
import type { Candle, ChartLevel } from "../src/levels/types.js";

function candle(ts: number, open: number, high: number, low: number, close: number): Candle {
  return { ts, open: String(open), high: String(high), low: String(low), close: String(close), volume: "100" };
}

describe("ReversalBacktester", () => {
  it("detects a winning demand reaction after touch", () => {
    const candles = [
      candle(1, 100, 102, 99, 101),
      candle(2, 101, 103, 100, 102),
      candle(3, 102, 102, 95, 96),
      candle(4, 96, 105, 96, 104)
    ];

    const levels: ChartLevel[] = [{
      id: "level-1",
      engine: "test",
      symbol: "BTC-USD",
      timeframe: "1m",
      side: "demand",
      price: "96",
      createdAt: 2,
      strength: 80,
      confidence: 0.8
    }];

    const report = new ReversalBacktester().run({
      exchange: "hyperliquid",
      symbol: "BTC-USD",
      interval: "1m",
      lookback: 100,
      reactionBars: 3,
      reactionBps: 50,
      maxDistanceBps: 1
    }, candles, levels);

    expect(report.summary.touches).toBe(1);
    expect(report.summary.wins).toBe(1);
  });

  it("does not test a level before it was created", () => {
    const candles = [
      candle(1, 100, 110, 90, 100),
      candle(2, 100, 101, 99, 100)
    ];

    const levels: ChartLevel[] = [{
      id: "future-level",
      engine: "test",
      symbol: "BTC-USD",
      timeframe: "1m",
      side: "demand",
      price: "90",
      createdAt: 2,
      strength: 80,
      confidence: 0.8
    }];

    const report = new ReversalBacktester().run({
      exchange: "hyperliquid",
      symbol: "BTC-USD",
      interval: "1m",
      lookback: 100,
      reactionBars: 3,
      reactionBps: 50,
      maxDistanceBps: 1
    }, candles, levels);

    expect(report.summary.touches).toBe(0);
  });
});
