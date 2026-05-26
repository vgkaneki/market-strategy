export type ExchangeId = "hyperliquid" | "dydx";

export interface NormalizedTrade {
  type: "trade";
  exchange: ExchangeId;
  symbol: string;
  venueSymbol: string;
  ts: number;
  receivedAt: number;
  tradeId: string;
  side: "buy" | "sell" | "unknown";
  price: string;
  size: string;
}

export interface NormalizedBookSnapshot {
  type: "book_snapshot";
  exchange: ExchangeId;
  symbol: string;
  venueSymbol: string;
  ts: number;
  receivedAt: number;
  seq: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface NormalizedBookDelta {
  type: "book_delta";
  exchange: ExchangeId;
  symbol: string;
  venueSymbol: string;
  ts: number;
  receivedAt: number;
  seq: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface NormalizedCandle {
  type: "candle";
  exchange: ExchangeId;
  symbol: string;
  venueSymbol: string;
  interval: string;
  ts: number;
  receivedAt: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closed?: boolean;
}

export type NormalizedMarketEvent =
  | NormalizedTrade
  | NormalizedBookSnapshot
  | NormalizedBookDelta
  | NormalizedCandle;

export function topicFor(event: NormalizedMarketEvent): string {
  if (event.type === "book_delta" || event.type === "book_snapshot") {
    return `${event.exchange}:book:${event.venueSymbol}`;
  }
  if (event.type === "trade") {
    return `${event.exchange}:trades:${event.venueSymbol}`;
  }
  return `${event.exchange}:candles:${event.venueSymbol}`;
}
