import type {
  NormalizedBookSnapshot,
  NormalizedCandle,
  NormalizedMarketEvent,
  NormalizedTrade
} from "../types.js";
import { toCanonicalSymbol } from "../symbols.js";

function sideFromHyperliquid(rawSide: unknown): "buy" | "sell" | "unknown" {
  if (rawSide === "B" || rawSide === "buy" || rawSide === "BUY") return "buy";
  if (rawSide === "A" || rawSide === "sell" || rawSide === "SELL") return "sell";
  return "unknown";
}

function normalizeLevels(levels: unknown): [string, string][] {
  if (!Array.isArray(levels)) return [];

  return levels
    .map((level) => {
      if (Array.isArray(level)) {
        return [String(level[0]), String(level[1])] as [string, string];
      }
      if (typeof level === "object" && level !== null) {
        const l = level as Record<string, unknown>;
        return [String(l.px ?? l.price ?? "0"), String(l.sz ?? l.size ?? "0")] as [string, string];
      }
      return undefined;
    })
    .filter(Boolean) as [string, string][];
}

export function normalizeHyperliquidMessage(raw: unknown, receivedAt = Date.now()): NormalizedMarketEvent[] {
  if (typeof raw !== "object" || raw === null) return [];
  const msg = raw as Record<string, any>;
  const channel = msg.channel;
  const data = msg.data;
  if (!channel || data == null) return [];

  if (channel === "l2Book") {
    const venueSymbol = String(data.coin ?? data.s ?? "UNKNOWN");
    const symbol = toCanonicalSymbol("hyperliquid", venueSymbol);
    const levels = Array.isArray(data.levels) ? data.levels : [[], []];
    const bids = normalizeLevels(levels[0]);
    const asks = normalizeLevels(levels[1]);

    const event: NormalizedBookSnapshot = {
      type: "book_snapshot",
      exchange: "hyperliquid",
      symbol,
      venueSymbol,
      ts: Number(data.time ?? data.t ?? receivedAt),
      receivedAt,
      seq: Number(data.time ?? receivedAt),
      bids,
      asks
    };
    return [event];
  }

  if (channel === "trades") {
    const trades = Array.isArray(data) ? data : [data];
    return trades
      .filter((trade) => trade && typeof trade === "object")
      .map((trade: Record<string, unknown>, index: number): NormalizedTrade => {
        const venueSymbol = String(trade.coin ?? "UNKNOWN");
        return {
          type: "trade",
          exchange: "hyperliquid",
          symbol: toCanonicalSymbol("hyperliquid", venueSymbol),
          venueSymbol,
          ts: Number(trade.time ?? receivedAt),
          receivedAt,
          tradeId: String(trade.tid ?? `${trade.time ?? receivedAt}:${index}`),
          side: sideFromHyperliquid(trade.side),
          price: String(trade.px ?? trade.price ?? "0"),
          size: String(trade.sz ?? trade.size ?? "0")
        };
      });
  }

  if (channel === "candle") {
    const c = data;
    const venueSymbol = String(c.s ?? c.coin ?? "UNKNOWN");
    const event: NormalizedCandle = {
      type: "candle",
      exchange: "hyperliquid",
      symbol: toCanonicalSymbol("hyperliquid", venueSymbol),
      venueSymbol,
      interval: String(c.i ?? c.interval ?? "unknown"),
      ts: Number(c.t ?? receivedAt),
      receivedAt,
      open: String(c.o ?? "0"),
      high: String(c.h ?? "0"),
      low: String(c.l ?? "0"),
      close: String(c.c ?? "0"),
      volume: String(c.v ?? "0"),
      closed: Boolean(c.closed ?? false)
    };
    return [event];
  }

  return [];
}
