import { describe, expect, it } from "vitest";
import { LceDataMapper } from "../src/lce-sdk/LceDataMapper.js";

describe("LceDataMapper", () => {
  it("maps platform symbol to SDK symbol", () => {
    const mapper = new LceDataMapper();
    expect(mapper.toSdkSymbol("BTC-USD")).toBe("BTC");
    expect(mapper.toSdkSymbol("ETHUSDT")).toBe("ETH");
  });

  it("maps candles into SDK format", () => {
    const mapper = new LceDataMapper();
    const candles = mapper.toSdkCandles([
      { ts: 1, open: "100", high: "110", low: "90", close: "105", volume: "10" }
    ]);

    expect(candles[0]).toEqual({
      time: 1,
      open: 100,
      high: 110,
      low: 90,
      close: 105,
      volume: 10
    });
  });

  it("filters invalid candles", () => {
    const mapper = new LceDataMapper();
    expect(mapper.toSdkCandles([{ ts: 1, open: "0", high: "0", low: "0", close: "0" }])).toHaveLength(0);
  });
});
