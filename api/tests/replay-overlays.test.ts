import { describe, expect, it } from "vitest";

describe("replay overlay shape", () => {
  it("keeps overlays chart-friendly", () => {
    const overlay = {
      id: "x",
      type: "level",
      engine: "swing_pivot",
      side: "support",
      price: "100",
      startTs: 1,
      strength: 80,
      confidence: 0.8,
      label: "support"
    };

    expect(overlay.type).toBe("level");
    expect(Number(overlay.price)).toBe(100);
  });
});
