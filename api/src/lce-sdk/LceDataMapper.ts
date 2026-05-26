import type { Candle } from "../levels/types.js";

export interface LceBookInput {
  bids?: Array<[string | number, string | number]>;
  asks?: Array<[string | number, string | number]>;
  ts?: number | string;
  time?: number | string;
}

export interface LceTradeInput {
  ts?: number | string;
  time?: number | string;
  price?: string | number;
  px?: string | number;
  size?: string | number;
  sz?: string | number;
  side?: string;
}

export class LceDataMapper {
  toSdkSymbol(symbol: string) {
    return String(symbol || "")
      .replace("-USD", "")
      .replace("USDT", "")
      .replace("PERP", "")
      .toUpperCase()
      .trim();
  }

  toSdkCandles(candles: Candle[] | any[]) {
    return (candles ?? []).map((c) => ({
      time: c.time ?? c.timeMs ?? c.ts,
      open: Number(c.open ?? c.o),
      high: Number(c.high ?? c.h),
      low: Number(c.low ?? c.l),
      close: Number(c.close ?? c.c),
      volume: Number(c.volume ?? c.v ?? 0)
    })).filter((c) =>
      Number.isFinite(c.open) &&
      Number.isFinite(c.high) &&
      Number.isFinite(c.low) &&
      Number.isFinite(c.close) &&
      c.high >= c.low &&
      c.high > 0 &&
      c.low > 0
    );
  }

  toSdkBook(book?: LceBookInput | null) {
    if (!book) return undefined;
    return {
      time: book.time ?? book.ts ?? Date.now(),
      bids: (book.bids ?? []).map(([price, size]) => [Number(price), Number(size)]),
      asks: (book.asks ?? []).map(([price, size]) => [Number(price), Number(size)])
    };
  }

  toSdkTrades(trades?: LceTradeInput[] | null) {
    return (trades ?? []).map((t) => ({
      time: t.time ?? t.ts ?? Date.now(),
      price: Number(t.price ?? t.px),
      size: Number(t.size ?? t.sz ?? 0),
      side: t.side ?? "unknown"
    })).filter((t) => Number.isFinite(t.price) && t.price > 0 && Number.isFinite(t.size));
  }
}
