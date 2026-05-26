export interface Candle {
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export type LevelSide = "support" | "resistance" | "demand" | "supply";

export interface ChartLevel {
  id: string;
  engine: string;
  symbol: string;
  timeframe: string;
  side: LevelSide;
  price: string;
  createdAt: number;
  expiresAt?: number;
  strength: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface LevelEngineContext {
  symbol: string;
  timeframe: string;
  candles: Candle[];
  now?: number;
}

export interface LevelEngine {
  id: string;
  label: string;
  minCandles: number;
  generate(context: LevelEngineContext): ChartLevel[];
}

export function candleHigh(candle: Candle): number {
  return Number(candle.high);
}

export function candleLow(candle: Candle): number {
  return Number(candle.low);
}

export function candleClose(candle: Candle): number {
  return Number(candle.close);
}
