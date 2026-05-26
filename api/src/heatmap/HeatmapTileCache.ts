import type { FastifyBaseLogger } from "fastify";
import type { Redis } from "ioredis";
import type { NormalizedBookDelta, NormalizedBookSnapshot } from "../market/types.js";

export interface HeatmapTile {
  exchange: string;
  symbol: string;
  ts: number;
  bucketSize: number;
  buckets: Array<{ price: string; bidLiquidity: string; askLiquidity: string; intensity: number }>;
}

type BookEvent = NormalizedBookSnapshot | NormalizedBookDelta;

function bucketPrice(price: string, bucketSize: number): string {
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return String(Math.round(n / bucketSize) * bucketSize);
}

function add(a: string, b: string): string {
  const n = Number(a) + Number(b);
  return Number.isFinite(n) ? String(n) : a;
}

export class HeatmapTileCache {
  constructor(
    private readonly redis: Redis,
    private readonly logger: FastifyBaseLogger,
    private readonly bucketSize = 25,
    private readonly ttlSeconds = 120
  ) {}

  async handleBookEvent(event: BookEvent) {
    const tile = this.buildTile(event);
    await this.redis.set(this.key(event.exchange, event.symbol), JSON.stringify(tile), "EX", this.ttlSeconds);
    return tile;
  }

  async getLatest(exchange: string, symbol: string): Promise<HeatmapTile | null> {
    const raw = await this.redis.get(this.key(exchange, symbol));
    if (!raw) return null;
    try { return JSON.parse(raw) as HeatmapTile; }
    catch (err) { this.logger.warn({ err }, "failed to parse heatmap tile"); return null; }
  }

  buildTile(event: BookEvent): HeatmapTile {
    const map = new Map<string, { bidLiquidity: string; askLiquidity: string }>();
    for (const [price, size] of event.bids) {
      const bucket = bucketPrice(price, this.bucketSize);
      const cur = map.get(bucket) ?? { bidLiquidity: "0", askLiquidity: "0" };
      cur.bidLiquidity = add(cur.bidLiquidity, size);
      map.set(bucket, cur);
    }
    for (const [price, size] of event.asks) {
      const bucket = bucketPrice(price, this.bucketSize);
      const cur = map.get(bucket) ?? { bidLiquidity: "0", askLiquidity: "0" };
      cur.askLiquidity = add(cur.askLiquidity, size);
      map.set(bucket, cur);
    }

    let max = 0;
    for (const v of map.values()) max = Math.max(max, Number(v.bidLiquidity), Number(v.askLiquidity));

    const buckets = [...map.entries()].map(([price, value]) => {
      const combined = Math.max(Number(value.bidLiquidity), Number(value.askLiquidity));
      return { price, bidLiquidity: value.bidLiquidity, askLiquidity: value.askLiquidity, intensity: max > 0 ? combined / max : 0 };
    }).sort((a, b) => Number(b.price) - Number(a.price));

    return { exchange: event.exchange, symbol: event.symbol, ts: event.ts, bucketSize: this.bucketSize, buckets };
  }

  private key(exchange: string, symbol: string) { return `heatmap:latest:${exchange}:${symbol}`; }
}
