import type { ChartLevel } from "../levels/types.js";

export interface ConfluenceZone {
  id: string;
  symbol: string;
  side: string;
  lowPrice: string;
  highPrice: string;
  midPrice: string;
  score: number;
  levelCount: number;
  timeframes: string[];
  engines: string[];
  levels: ChartLevel[];
}
