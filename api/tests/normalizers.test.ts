import { describe, expect, it } from "vitest";
import { normalizeHyperliquidMessage } from "../src/market/normalizers/hyperliquid.js";
import { normalizeDydxMessage } from "../src/market/normalizers/dydx.js";

describe("market normalizers", () => {
  it("normalizes Hyperliquid trades", () => {
    const events = normalizeHyperliquidMessage({
      channel: "trades",
      data: [{ coin: "BTC", side: "B", px: "65000", sz: "0.1", time: 1, tid: 99 }]
    }, 2);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "trade",
      exchange: "hyperliquid",
      symbol: "BTC-USD",
      venueSymbol: "BTC",
      price: "65000",
      size: "0.1"
    });
  });

  it("normalizes Hyperliquid book snapshots", () => {
    const events = normalizeHyperliquidMessage({
      channel: "l2Book",
      data: {
        coin: "BTC",
        time: 123,
        levels: [
          [{ px: "65000", sz: "1" }],
          [{ px: "65001", sz: "2" }]
        ]
      }
    });

    expect(events[0]).toMatchObject({
      type: "book_snapshot",
      exchange: "hyperliquid",
      symbol: "BTC-USD"
    });
  });

  it("normalizes dYdX orderbook", () => {
    const events = normalizeDydxMessage({
      type: "subscribed",
      channel: "v4_orderbook",
      id: "BTC-USD",
      contents: {
        bids: [{ price: "65000", size: "1" }],
        asks: [{ price: "65010", size: "1" }]
      }
    });

    expect(events[0]).toMatchObject({
      type: "book_snapshot",
      exchange: "dydx",
      symbol: "BTC-USD",
      venueSymbol: "BTC-USD"
    });
  });
});
