import type { ChartLevel, LevelEngine, LevelEngineContext } from "./types.js";
import { candleHigh, candleLow } from "./types.js";

export class SwingPivotLevelEngine implements LevelEngine {
  id = "swing_pivot";
  label = "Swing Pivot Levels";
  minCandles = 25;

  constructor(private readonly left = 3, private readonly right = 3) {}

  generate(context: LevelEngineContext): ChartLevel[] {
    const { candles, symbol, timeframe } = context;
    if (candles.length < this.minCandles) return [];

    const levels: ChartLevel[] = [];

    for (let i = this.left; i < candles.length - this.right; i++) {
      const current = candles[i];
      const high = candleHigh(current);
      const low = candleLow(current);

      let isSwingHigh = true;
      let isSwingLow = true;

      for (let j = i - this.left; j <= i + this.right; j++) {
        if (j === i) continue;
        if (candleHigh(candles[j]) >= high) isSwingHigh = false;
        if (candleLow(candles[j]) <= low) isSwingLow = false;
      }

      if (isSwingHigh) {
        levels.push({
          id: `${this.id}:${symbol}:${timeframe}:resistance:${current.ts}:${current.high}`,
          engine: this.id,
          symbol,
          timeframe,
          side: "resistance",
          price: current.high,
          createdAt: current.ts,
          strength: this.strength(candles, i, "high"),
          confidence: 0.55,
          metadata: { pivotIndex: i, left: this.left, right: this.right }
        });
      }

      if (isSwingLow) {
        levels.push({
          id: `${this.id}:${symbol}:${timeframe}:support:${current.ts}:${current.low}`,
          engine: this.id,
          symbol,
          timeframe,
          side: "support",
          price: current.low,
          createdAt: current.ts,
          strength: this.strength(candles, i, "low"),
          confidence: 0.55,
          metadata: { pivotIndex: i, left: this.left, right: this.right }
        });
      }
    }

    return levels.slice(-200);
  }

  private strength(candles: LevelEngineContext["candles"], index: number, kind: "high" | "low"): number {
    const current = kind === "high" ? candleHigh(candles[index]) : candleLow(candles[index]);
    const lookback = candles.slice(Math.max(0, index - 20), index + 1);
    const ranges = lookback.map((c) => Math.max(0, candleHigh(c) - candleLow(c)));
    const avgRange = ranges.reduce((a, b) => a + b, 0) / Math.max(1, ranges.length);

    if (avgRange <= 0) return 50;

    const prominence =
      kind === "high"
        ? current - Math.max(...lookback.filter((_, i) => i !== lookback.length - 1).map(candleHigh))
        : Math.min(...lookback.filter((_, i) => i !== lookback.length - 1).map(candleLow)) - current;

    return Math.max(1, Math.min(100, Math.round(50 + (prominence / avgRange) * 25)));
  }
}
