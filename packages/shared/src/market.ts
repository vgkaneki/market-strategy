export type ExchangeId = "hyperliquid" | "dydx";
export type VenueSymbol = string;
export type CanonicalSymbol = "BTC-USD" | "ETH-USD" | "SOL-USD" | string;

export type MarketEventType =
  | "trade"
  | "book_snapshot"
  | "book_delta"
  | "candle"
  | "venue_status";

export interface BaseMarketEvent {
  type: MarketEventType;
  exchange: ExchangeId;
  symbol: CanonicalSymbol;
  venueSymbol: VenueSymbol;
  ts: number;
  receivedAt: number;
}

export interface NormalizedTrade extends BaseMarketEvent {
  type: "trade";
  tradeId: string;
  side: "buy" | "sell" | "unknown";
  price: string;
  size: string;
}

export interface NormalizedBookSnapshot extends BaseMarketEvent {
  type: "book_snapshot";
  seq: number;
  bids: [price: string, size: string][];
  asks: [price: string, size: string][];
}

export interface NormalizedBookDelta extends BaseMarketEvent {
  type: "book_delta";
  seq: number;
  bids: [price: string, size: string][];
  asks: [price: string, size: string][];
}

export interface NormalizedCandle extends BaseMarketEvent {
  type: "candle";
  interval: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closed?: boolean;
}

export interface VenueStatus extends BaseMarketEvent {
  type: "venue_status";
  status: "connected" | "disconnected" | "stale" | "error";
  message?: string;
}

export type NormalizedMarketEvent =
  | NormalizedTrade
  | NormalizedBookSnapshot
  | NormalizedBookDelta
  | NormalizedCandle
  | VenueStatus;

export function topicFor(event: NormalizedMarketEvent): string {
  const channel =
    event.type === "book_delta" || event.type === "book_snapshot"
      ? "book"
      : event.type === "trade"
        ? "trades"
        : event.type === "candle"
          ? "candles"
          : "status";

  return `${event.exchange}:${channel}:${event.venueSymbol}`;
}
