export type BackfillExchange = "hyperliquid" | "dydx";

export interface HistoricalCandle {
  exchange: BackfillExchange;
  symbol: string;
  venueSymbol: string;
  interval: string;
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  source: string;
}

export interface BackfillRequest {
  exchange: BackfillExchange;
  symbol: string;
  interval: string;
  startTs: string;
  endTs: string;
}

export interface BackfillJob {
  id: string;
  request: BackfillRequest;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: number;
  updatedAt: number;
  candlesInserted: number;
  error?: string;
}
