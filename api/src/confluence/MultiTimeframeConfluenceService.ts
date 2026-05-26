import type { Candle, ChartLevel } from "../levels/types.js";
import { LevelEngineRegistry } from "../levels/LevelEngineRegistry.js";
import type { ConfluenceZone } from "./types.js";

function bpsDistance(a: number, b: number) {
  const mid = (a + b) / 2;
  if (!Number.isFinite(mid) || mid === 0) return Infinity;
  return Math.abs((a - b) / mid) * 10_000;
}

function sameBias(a: string, b: string) {
  const demand = new Set(["support", "demand"]);
  const supply = new Set(["resistance", "supply"]);
  return (demand.has(a) && demand.has(b)) || (supply.has(a) && supply.has(b));
}

export class MultiTimeframeConfluenceService {
  constructor(
    private readonly registry = new LevelEngineRegistry(),
    private readonly distanceBps = 10
  ) {}

  run(input: {
    symbol: string;
    candlesByTimeframe: Record<string, Candle[]>;
    engineIds?: string[];
  }): ConfluenceZone[] {
    const allLevels: ChartLevel[] = [];

    for (const [timeframe, candles] of Object.entries(input.candlesByTimeframe)) {
      allLevels.push(...this.registry.generateAll({
        symbol: input.symbol,
        timeframe,
        candles
      }, input.engineIds));
    }

    const sorted = allLevels
      .filter((level) => Number.isFinite(Number(level.price)))
      .sort((a, b) => Number(a.price) - Number(b.price));

    const zones: ConfluenceZone[] = [];

    for (const level of sorted) {
      const price = Number(level.price);
      const match = zones.find((zone) => {
        return sameBias(zone.side, level.side) &&
          bpsDistance(Number(zone.midPrice), price) <= this.distanceBps;
      });

      if (match) {
        match.levels.push(level);
        match.levelCount = match.levels.length;
        const prices = match.levels.map((l) => Number(l.price));
        const low = Math.min(...prices);
        const high = Math.max(...prices);
        match.lowPrice = String(low);
        match.highPrice = String(high);
        match.midPrice = String((low + high) / 2);
        match.timeframes = [...new Set(match.levels.map((l) => l.timeframe))];
        match.engines = [...new Set(match.levels.map((l) => l.engine))];
        match.score = this.score(match.levels);
      } else {
        zones.push({
          id: `zone:${input.symbol}:${level.side}:${level.price}:${level.createdAt}`,
          symbol: input.symbol,
          side: level.side,
          lowPrice: level.price,
          highPrice: level.price,
          midPrice: level.price,
          score: this.score([level]),
          levelCount: 1,
          timeframes: [level.timeframe],
          engines: [level.engine],
          levels: [level]
        });
      }
    }

    return zones
      .filter((zone) => zone.levelCount >= 2 || zone.timeframes.length >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }

  private score(levels: ChartLevel[]) {
    const strength = levels.reduce((sum, level) => sum + level.strength, 0) / Math.max(1, levels.length);
    const tfBonus = new Set(levels.map((level) => level.timeframe)).size * 10;
    const engineBonus = new Set(levels.map((level) => level.engine)).size * 8;
    const countBonus = Math.min(30, levels.length * 5);
    return Math.min(100, Math.round(strength * 0.55 + tfBonus + engineBonus + countBonus));
  }
}
