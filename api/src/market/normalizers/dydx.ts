import type {
  NormalizedBookDelta,
  NormalizedBookSnapshot,
  NormalizedCandle,
  NormalizedMarketEvent,
  NormalizedTrade
} from "../types.js";
import { toCanonicalSymbol } from "../symbols.js";

function parseLevelList(levels: unknown): [string, string][] {
  if (!Array.isArray(levels)) return [];

  return levels
    .map((level) => {
      if (Array.isArray(level)) {
        return [String(level[0]), String(level[1])] as [string, string];
      }
      if (typeof level === "object" && level !== null) {
        const l = level as Record<string, unknown>;
        return [String(l.price ?? l.px ?? "0"), String(l.size ?? l.sz ?? "0")] as [string, string];
      }
      return undefined;
    })
    .filter(Boolean) as [string, string][];
}

function sideFromDydx(side: unknown): "buy" | "sell" | "unknown" {
  const s = String(side ?? "").toUpperCase();
  if (s === "BUY" || s === "BID") return "buy";
  if (s === "SELL" || s === "ASK") return "sell";
  return "unknown";
}

export function normalizeDydxMessage(raw: unknown, receivedAt = Date.now()): NormalizedMarketEvent[] {
  if (typeof raw !== "object" || raw === null) return [];
  const msg = raw as Record<string, any>;

  const channel = String(msg.channel ?? "");
  const id = String(msg.id ?? "");
  const contents = msg.contents ?? msg.data ?? {};
  if (!channel || !id) return [];

  const venueSymbol = id.includes("/") ? id.split("/")[0] : id;
  const symbol = toCanonicalSymbol("dydx", venueSymbol);

  if (channel === "v4_orderbook") {
    const bids = parseLevelList(contents.bids ?? contents.bidUpdates ?? []);
    const asks = parseLevelList(contents.asks ?? contents.askUpdates ?? []);
    const seq = Number(contents.sequence ?? contents.offset ?? receivedAt);
    const isSnapshot = msg.type === "subscribed" || Array.isArray(contents.bids) || Array.isArray(contents.asks);

    const event: NormalizedBookSnapshot | NormalizedBookDelta = {
      type: isSnapshot ? "book_snapshot" : "book_delta",
      exchange: "dydx",
      symbol,
      venueSymbol,
      ts: Number(contents.updatedAt ?? contents.createdAt ?? receivedAt),
      receivedAt,
      seq,
      bids,
      asks
    };
    return [event];
  }

  if (channel === "v4_trades") {
    const trades: unknown[] = Array.isArray(contents.trades) ? contents.trades : Array.isArray(contents) ? contents : [contents];
    return trades
      .filter((trade): trade is Record<string, unknown> => Boolean(trade && typeof trade === "object"))
      .map((trade, index): NormalizedTrade => ({
        type: "trade",
        exchange: "dydx",
        symbol,
        venueSymbol,
        ts: Date.parse(String(trade.createdAt ?? "")) || receivedAt,
        receivedAt,
        tradeId: String(trade.id ?? `${receivedAt}:${index}`),
        side: sideFromDydx(trade.side),
        price: String(trade.price ?? "0"),
        size: String(trade.size ?? "0")
      }));
  }

  if (channel === "v4_candles") {
    const candle = Array.isArray(contents.candles) ? contents.candles[0] : contents;
    if (!candle || typeof candle !== "object") return [];

    const event: NormalizedCandle = {
      type: "candle",
      exchange: "dydx",
      symbol,
      venueSymbol,
      interval: id.includes("/") ? id.split("/")[1] : "unknown",
      ts: Date.parse(String(candle.startedAt ?? candle.updatedAt ?? "")) || receivedAt,
      receivedAt,
      open: String(candle.open ?? "0"),
      high: String(candle.high ?? "0"),
      low: String(candle.low ?? "0"),
      close: String(candle.close ?? "0"),
      volume: String(candle.usdVolume ?? candle.baseTokenVolume ?? candle.volume ?? "0"),
      closed: false
    };
    return [event];
  }

  return [];
}
