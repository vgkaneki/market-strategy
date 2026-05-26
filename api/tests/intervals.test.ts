import { describe, expect, it } from "vitest";
import { assertHyperliquidInterval, toDydxResolution } from "../src/backfill/intervals.js";

describe("backfill intervals", () => {
  it("maps dYdX resolutions", () => {
    expect(toDydxResolution("1m")).toBe("1MIN");
    expect(toDydxResolution("1h")).toBe("1HOUR");
  });

  it("accepts Hyperliquid supported interval", () => {
    expect(() => assertHyperliquidInterval("15m")).not.toThrow();
  });

  it("rejects unsupported Hyperliquid interval", () => {
    expect(() => assertHyperliquidInterval("2m")).toThrow();
  });
});
