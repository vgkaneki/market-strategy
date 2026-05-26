import type { ChartLevel, LevelEngine, LevelEngineContext } from "./types.js";
import { candleClose, candleHigh, candleLow } from "./types.js";

export class LiquiditySweepLevelEngine implements LevelEngine {
  id = "liquidity_sweep";
  label = "Liquidity Sweep Reclaim Levels";
  minCandles = 30;

  constructor(private readonly lookback = 10) {}

  generate(context: LevelEngineContext): ChartLevel[] {
    const { candles, symbol, timeframe } = context;
    if (candles.length < this.minCandles) return [];

    const levels: ChartLevel[] = [];

    for (let i = this.lookback; i < candles.length; i++) {
      const candle = candles[i];
      const prior = candles.slice(i - this.lookback, i);
      const priorHigh = Math.max(...prior.map(candleHigh));
      const priorLow = Math.min(...prior.map(candleLow));
      const high = candleHigh(candle);
      const low = candleLow(candle);
      const close = candleClose(candle);

      // Bearish sweep: takes previous high, closes back below it.
      if (high > priorHigh && close < priorHigh) {
        levels.push({
          id: `${this.id}:${symbol}:${timeframe}:supply:${candle.ts}:${priorHigh}`,
          engine: this.id,
          symbol,
          timeframe,
          side: "supply",
          price: String(priorHigh),
          createdAt: candle.ts,
          strength: this.scoreSweep(high - priorHigh, candle),
          confidence: 0.6,
          metadata: {
            sweepType: "bearish_high_sweep",
            sweptPrice: priorHigh,
            candleHigh: candle.high,
            candleClose: candle.close
          }
        });
      }

      // Bullish sweep: takes previous low, closes back above it.
      if (low < priorLow && close > priorLow) {
        levels.push({
          id: `${this.id}:${symbol}:${timeframe}:demand:${candle.ts}:${priorLow}`,
          engine: this.id,
          symbol,
          timeframe,
          side: "demand",
          price: String(priorLow),
          createdAt: candle.ts,
          strength: this.scoreSweep(priorLow - low, candle),
          confidence: 0.6,
          metadata: {
            sweepType: "bullish_low_sweep",
            sweptPrice: priorLow,
            candleLow: candle.low,
            candleClose: candle.close
          }
        });
      }
    }

    return levels.slice(-200);
  }

  private scoreSweep(distance: number, candle: LevelEngineContext["candles"][number]): number {
    const range = Math.max(1e-9, candleHigh(candle) - candleLow(candle));
    const ratio = distance / range;
    return Math.max(1, Math.min(100, Math.round(50 + ratio * 100)));
  }
}
