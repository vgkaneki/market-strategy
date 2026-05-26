export interface DepthLevel {
  price: string;
  size: string;
}

export interface DepthFrame {
  exchange: string;
  symbol: string;
  ts: number;
  bids: DepthLevel[];
  asks: DepthLevel[];
}

export interface HeatmapCell {
  price: string;
  bidIntensity: number;
  askIntensity: number;
  totalLiquidity: string;
  lastUpdated: number;
}

export interface HeatmapEngineConfig {
  bucketSize: number;
  decayHalfLifeMs: number;
  maxRows: number;
  minVisibleIntensity: number;
}

function bucket(price: number, bucketSize: number) {
  return Math.round(price / bucketSize) * bucketSize;
}

function decay(value: number, elapsedMs: number, halfLifeMs: number) {
  if (halfLifeMs <= 0) return value;
  return value * Math.pow(0.5, elapsedMs / halfLifeMs);
}

/**
 * Proprietary high-density liquidity heatmap engine.
 *
 * It is designed to produce Bookmap-style functionality without copying any
 * proprietary Bookmap implementation or UI assets.
 */
export class HighDensityHeatmapEngine {
  private cells = new Map<string, HeatmapCell>();

  constructor(private readonly config: HeatmapEngineConfig) {}

  applyFrame(frame: DepthFrame) {
    this.decayExisting(frame.ts);

    for (const level of frame.bids) {
      this.applyLevel(level, "bid", frame.ts);
    }

    for (const level of frame.asks) {
      this.applyLevel(level, "ask", frame.ts);
    }

    return this.snapshot(frame.ts);
  }

  snapshot(ts = Date.now()) {
    this.decayExisting(ts);

    const rows = [...this.cells.values()]
      .filter((cell) => Math.max(cell.bidIntensity, cell.askIntensity) >= this.config.minVisibleIntensity)
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, this.config.maxRows);

    const max = Math.max(1, ...rows.map((row) => Math.max(row.bidIntensity, row.askIntensity)));

    return rows.map((row) => ({
      ...row,
      bidIntensity: row.bidIntensity / max,
      askIntensity: row.askIntensity / max
    }));
  }

  private applyLevel(level: DepthLevel, side: "bid" | "ask", ts: number) {
    const price = Number(level.price);
    const size = Number(level.size);
    if (!Number.isFinite(price) || !Number.isFinite(size) || size < 0) return;

    const bucketPrice = String(bucket(price, this.config.bucketSize));
    const current = this.cells.get(bucketPrice) ?? {
      price: bucketPrice,
      bidIntensity: 0,
      askIntensity: 0,
      totalLiquidity: "0",
      lastUpdated: ts
    };

    const intensity = Math.log1p(size);
    if (side === "bid") current.bidIntensity = Math.max(current.bidIntensity, intensity);
    else current.askIntensity = Math.max(current.askIntensity, intensity);

    current.totalLiquidity = String(Number(current.totalLiquidity) + size);
    current.lastUpdated = ts;
    this.cells.set(bucketPrice, current);
  }

  private decayExisting(ts: number) {
    for (const [key, cell] of this.cells) {
      const elapsed = Math.max(0, ts - cell.lastUpdated);
      cell.bidIntensity = decay(cell.bidIntensity, elapsed, this.config.decayHalfLifeMs);
      cell.askIntensity = decay(cell.askIntensity, elapsed, this.config.decayHalfLifeMs);
      cell.lastUpdated = ts;

      if (Math.max(cell.bidIntensity, cell.askIntensity) < this.config.minVisibleIntensity / 10) {
        this.cells.delete(key);
      }
    }
  }
}
