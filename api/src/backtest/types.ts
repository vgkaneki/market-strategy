import type { Candle, ChartLevel } from "../levels/types.js";

export interface BacktestRequest {
  exchange: string;
  symbol: string;
  interval: string;
  lookback: number;
  reactionBars: number;
  reactionBps: number;
  maxDistanceBps: number;
  engineIds?: string[];
}

export interface LevelReactionTrade {
  levelId: string;
  engine: string;
  side: string;
  price: string;
  touchedAt: number;
  result: "win" | "loss" | "timeout";
  maxFavorableBps: number;
  maxAdverseBps: number;
  barsHeld: number;
}

export interface BacktestSummary {
  candles: number;
  levelsGenerated: number;
  levelsTested: number;
  touches: number;
  wins: number;
  losses: number;
  timeouts: number;
  reactionRate: number;
  avgMfeBps: number;
  avgMaeBps: number;
}

export interface BacktestReport {
  request: BacktestRequest;
  summary: BacktestSummary;
  levels: ChartLevel[];
  trades: LevelReactionTrade[];
  candles?: Candle[];
}
