import type { BacktestReport, LevelReactionTrade } from "../backtest/types.js";

function pct(n: number) {
  return Math.round(n * 10000) / 100;
}

function avg(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export interface EngineBreakdown {
  engine: string;
  touches: number;
  wins: number;
  losses: number;
  timeouts: number;
  reactionRate: number;
  avgMfeBps: number;
  avgMaeBps: number;
}

export interface StrongValidationMetrics {
  totalTrades: number;
  reactionRate: number;
  lossRate: number;
  timeoutRate: number;
  avgMfeBps: number;
  avgMaeBps: number;
  expectancyProxy: number;
  byEngine: EngineBreakdown[];
}

export class ValidationMetrics {
  compute(report: BacktestReport): StrongValidationMetrics {
    const trades = report.trades;
    const wins = trades.filter((t) => t.result === "win").length;
    const losses = trades.filter((t) => t.result === "loss").length;
    const timeouts = trades.filter((t) => t.result === "timeout").length;

    return {
      totalTrades: trades.length,
      reactionRate: trades.length ? pct(wins / trades.length) : 0,
      lossRate: trades.length ? pct(losses / trades.length) : 0,
      timeoutRate: trades.length ? pct(timeouts / trades.length) : 0,
      avgMfeBps: Math.round(avg(trades.map((t) => t.maxFavorableBps)) * 100) / 100,
      avgMaeBps: Math.round(avg(trades.map((t) => t.maxAdverseBps)) * 100) / 100,
      expectancyProxy: this.expectancyProxy(trades),
      byEngine: this.byEngine(trades)
    };
  }

  private expectancyProxy(trades: LevelReactionTrade[]) {
    if (!trades.length) return 0;
    const values = trades.map((trade) => {
      if (trade.result === "win") return 1;
      if (trade.result === "loss") return -1;
      return 0;
    });
    return Math.round(avg(values) * 1000) / 1000;
  }

  private byEngine(trades: LevelReactionTrade[]): EngineBreakdown[] {
    const grouped = new Map<string, LevelReactionTrade[]>();
    for (const trade of trades) {
      grouped.set(trade.engine, [...(grouped.get(trade.engine) ?? []), trade]);
    }

    return [...grouped.entries()].map(([engine, rows]) => {
      const wins = rows.filter((t) => t.result === "win").length;
      const losses = rows.filter((t) => t.result === "loss").length;
      const timeouts = rows.filter((t) => t.result === "timeout").length;

      return {
        engine,
        touches: rows.length,
        wins,
        losses,
        timeouts,
        reactionRate: rows.length ? pct(wins / rows.length) : 0,
        avgMfeBps: Math.round(avg(rows.map((t) => t.maxFavorableBps)) * 100) / 100,
        avgMaeBps: Math.round(avg(rows.map((t) => t.maxAdverseBps)) * 100) / 100
      };
    }).sort((a, b) => b.reactionRate - a.reactionRate);
  }
}
