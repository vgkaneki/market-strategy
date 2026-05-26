import { describe, expect, it } from "vitest";
import { LiquidityWallScanner } from "../src/scanners/LiquidityWallScanner.js";

describe("LiquidityWallScanner", () => {
  it("detects large bid and ask walls", () => {
    const scanner = new LiquidityWallScanner(1_000_000);
    const signals = scanner.scan({ type: "book_snapshot", exchange: "hyperliquid", symbol: "BTC-USD", venueSymbol: "BTC", ts: 1, receivedAt: 1, seq: 1, bids: [["65000", "20"]], asks: [["65100", "30"]] });
    expect(signals.length).toBe(2);
    expect(signals[0].type).toBe("scanner_signal");
  });

  it("ignores small levels", () => {
    const scanner = new LiquidityWallScanner(1_000_000);
    const signals = scanner.scan({ type: "book_snapshot", exchange: "hyperliquid", symbol: "BTC-USD", venueSymbol: "BTC", ts: 1, receivedAt: 1, seq: 1, bids: [["65000", "1"]], asks: [["65100", "1"]] });
    expect(signals.length).toBe(0);
  });
});
