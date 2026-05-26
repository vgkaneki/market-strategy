export type BookSide = "bid" | "ask";
export type BookLevel = [price: string, size: string];

export interface BookSnapshot {
  bids: BookLevel[];
  asks: BookLevel[];
  seq: number;
  ts: number;
}

function sortBids(a: string, b: string) {
  return Number(b) - Number(a);
}

function sortAsks(a: string, b: string) {
  return Number(a) - Number(b);
}

/**
 * In-memory price-level order book.
 *
 * Prices and sizes are stored as strings to avoid JS floating-point mutation of source values.
 * Sorting uses Number only for display sorting. For production precision, replace sorting with
 * scaled-integer decimal comparison.
 */
export class OrderBook {
  private bids = new Map<string, string>();
  private asks = new Map<string, string>();
  private seq = 0;
  private ts = 0;

  applySnapshot(snapshot: BookSnapshot) {
    this.bids.clear();
    this.asks.clear();

    for (const [price, size] of snapshot.bids) {
      if (size !== "0") this.bids.set(price, size);
    }
    for (const [price, size] of snapshot.asks) {
      if (size !== "0") this.asks.set(price, size);
    }

    this.seq = snapshot.seq;
    this.ts = snapshot.ts;
  }

  applyDelta(delta: BookSnapshot) {
    if (delta.seq < this.seq) return;

    for (const [price, size] of delta.bids) {
      if (size === "0" || Number(size) === 0) this.bids.delete(price);
      else this.bids.set(price, size);
    }

    for (const [price, size] of delta.asks) {
      if (size === "0" || Number(size) === 0) this.asks.delete(price);
      else this.asks.set(price, size);
    }

    this.seq = delta.seq;
    this.ts = delta.ts;
  }

  top(depth = 25): BookSnapshot {
    const bids = [...this.bids.entries()]
      .sort(([a], [b]) => sortBids(a, b))
      .slice(0, depth) as BookLevel[];

    const asks = [...this.asks.entries()]
      .sort(([a], [b]) => sortAsks(a, b))
      .slice(0, depth) as BookLevel[];

    return { bids, asks, seq: this.seq, ts: this.ts };
  }
}
