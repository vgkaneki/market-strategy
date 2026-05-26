import type { NormalizedBookDelta, NormalizedBookSnapshot } from "../market/types.js";

export interface LiquidityWallSignal {
  type: "scanner_signal";
  scanner: "liquidity_wall";
  exchange: string;
  symbol: string;
  ts: number;
  side: "bid" | "ask";
  price: string;
  size: string;
  notional: string;
  score: number;
  reason: string;
}

type BookEvent = NormalizedBookSnapshot | NormalizedBookDelta;

function notional(price: string, size: string): number {
  const p = Number(price); const s = Number(size);
  return Number.isFinite(p) && Number.isFinite(s) ? p * s : 0;
}

export class LiquidityWallScanner {
  constructor(private readonly minWallNotional = 1_000_000) {}

  scan(event: BookEvent): LiquidityWallSignal[] {
    const out: LiquidityWallSignal[] = [];
    for (const [side, levels] of [["bid", event.bids], ["ask", event.asks]] as const) {
      for (const [price, size] of levels.slice(0, 50)) {
        const n = notional(price, size);
        if (n < this.minWallNotional) continue;
        out.push({
          type: "scanner_signal", scanner: "liquidity_wall", exchange: event.exchange,
          symbol: event.symbol, ts: event.ts, side, price, size,
          notional: String(Math.round(n)),
          score: Math.min(100, Math.round((n / this.minWallNotional) * 25)),
          reason: `${side.toUpperCase()} liquidity wall detected near ${price}`
        });
      }
    }
    return out.sort((a, b) => Number(b.notional) - Number(a.notional)).slice(0, 10);
  }
}
