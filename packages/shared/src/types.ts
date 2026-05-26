export type ExchangeId = "hyperliquid" | "dydx";
export type MarketChannel = "trades" | "book" | "candles" | "heatmap" | "scanner";

export interface MarketSubscription {
  type: "subscribe" | "unsubscribe";
  exchange: ExchangeId;
  channel: MarketChannel;
  symbol: string;
  interval?: string;
}

export interface NormalizedTrade {
  type: "trade";
  exchange: ExchangeId;
  symbol: string;
  ts: number;
  tradeId: string;
  side: "buy" | "sell" | "unknown";
  price: string;
  size: string;
}

export interface NormalizedBookDelta {
  type: "book_delta";
  exchange: ExchangeId;
  symbol: string;
  ts: number;
  seq: number;
  bids: [price: string, size: string][];
  asks: [price: string, size: string][];
}

export interface NormalizedCandle {
  type: "candle";
  exchange: ExchangeId;
  symbol: string;
  interval: string;
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export type MarketEvent = NormalizedTrade | NormalizedBookDelta | NormalizedCandle;

export interface AlertRule {
  id: string;
  userId: string;
  symbol: string;
  condition: "price_crosses_above" | "price_crosses_below" | "scanner_score_above";
  threshold: string;
  enabled: boolean;
}
