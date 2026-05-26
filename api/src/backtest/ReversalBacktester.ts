import type { Candle, ChartLevel } from "../levels/types.js";
import type { BacktestReport, BacktestRequest, LevelReactionTrade } from "./types.js";

function n(value: string | number): number {
  return Number(value);
}

function bps(from: number, to: number): number {
  if (!Number.isFinite(from) || from === 0) return 0;
  return ((to - from) / from) * 10_000;
}

function levelTouched(candle: Candle, price: number, maxDistanceBps: number): boolean {
  const high = n(candle.high);
  const low = n(candle.low);
  if (low <= price && high >= price) return true;

  const distToHigh = Math.abs(bps(price, high));
  const distToLow = Math.abs(bps(price, low));
  return Math.min(distToHigh, distToLow) <= maxDistanceBps;
}

function isDemandSide(side: string) {
  return side === "support" || side === "demand";
}

export class ReversalBacktester {
  run(request: BacktestRequest, candles: Candle[], levels: ChartLevel[]): BacktestReport {
    const trades: LevelReactionTrade[] = [];

    for (const level of levels) {
      const levelPrice = n(level.price);
      if (!Number.isFinite(levelPrice) || levelPrice <= 0) continue;

      // Critical no-lookahead guard:
      // a level can only be tested on candles strictly after its creation time.
      const startIndex = candles.findIndex((candle) => candle.ts > level.createdAt);
      if (startIndex < 0) continue;

      let touchedIndex = -1;
      for (let i = startIndex; i < candles.length; i++) {
        if (levelTouched(candles[i], levelPrice, request.maxDistanceBps)) {
          touchedIndex = i;
          break;
        }
      }

      if (touchedIndex < 0) continue;

      const window = candles.slice(touchedIndex, touchedIndex + request.reactionBars + 1);
      if (window.length === 0) continue;

      const demand = isDemandSide(level.side);
      let maxFavorableBps = 0;
      let maxAdverseBps = 0;
      let result: "win" | "loss" | "timeout" = "timeout";
      let barsHeld = 0;

      for (let j = 0; j < window.length; j++) {
        const c = window[j];
        const favorable = demand
          ? bps(levelPrice, n(c.high))
          : bps(n(c.low), levelPrice);
        const adverse = demand
          ? bps(n(c.low), levelPrice)
          : bps(levelPrice, n(c.high));

        maxFavorableBps = Math.max(maxFavorableBps, favorable);
        maxAdverseBps = Math.max(maxAdverseBps, adverse);
        barsHeld = j;

        if (favorable >= request.reactionBps) {
          result = "win";
          break;
        }

        if (adverse >= request.reactionBps) {
          result = "loss";
          break;
        }
      }

      trades.push({
        levelId: level.id,
        engine: level.engine,
        side: level.side,
        price: level.price,
        touchedAt: candles[touchedIndex].ts,
        result,
        maxFavorableBps: Math.round(maxFavorableBps * 100) / 100,
        maxAdverseBps: Math.round(maxAdverseBps * 100) / 100,
        barsHeld
      });
    }

    const wins = trades.filter((t) => t.result === "win").length;
    const losses = trades.filter((t) => t.result === "loss").length;
    const timeouts = trades.filter((t) => t.result === "timeout").length;
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      request,
      summary: {
        candles: candles.length,
        levelsGenerated: levels.length,
        levelsTested: levels.length,
        touches: trades.length,
        wins,
        losses,
        timeouts,
        reactionRate: trades.length ? Math.round((wins / trades.length) * 10000) / 100 : 0,
        avgMfeBps: Math.round(avg(trades.map((t) => t.maxFavorableBps)) * 100) / 100,
        avgMaeBps: Math.round(avg(trades.map((t) => t.maxAdverseBps)) * 100) / 100
      },
      levels,
      trades
    };
  }
}
