export interface HistoricalBookFrame {
  exchange: string;
  symbol: string;
  ts: number;
  seq: number;
  bids: [price: string, size: string][];
  asks: [price: string, size: string][];
  source: "captured_live" | "external_archive" | "vendor_snapshot";
}

export interface HistoricalBookQuery {
  exchange: string;
  symbol: string;
  startTs: string;
  endTs: string;
  limit: number;
}
