import { clickhouse } from "../clickhouse/client.js";
import { config } from "../config.js";

export interface ReplayFrameQuery {
  exchange: string;
  symbol: string;
  interval: string;
  cursor: number;
  limit: number;
  startTs?: string;
  endTs?: string;
}

export interface ReplayFrame {
  index: number;
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

type ReplayRow = {
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export class ReplayPlaybackService {
  sanitize(input: Partial<ReplayFrameQuery>): ReplayFrameQuery {
    return {
      exchange: input.exchange ?? "hyperliquid",
      symbol: input.symbol ?? "BTC-USD",
      interval: input.interval ?? "1m",
      cursor: Math.max(0, Number(input.cursor ?? 0)),
      limit: Math.min(Math.max(1, Number(input.limit ?? 200)), config.REPLAY_MAX_BATCH),
      startTs: input.startTs,
      endTs: input.endTs
    };
  }

  async getFrames(input: Partial<ReplayFrameQuery>) {
    const q = this.sanitize(input);

    const whereRange = q.startTs && q.endTs
      ? `AND ts >= parseDateTime64BestEffort({startTs:String}) AND ts <= parseDateTime64BestEffort({endTs:String})`
      : "";

    const result = await clickhouse.query({
      query: `
        SELECT
          toUnixTimestamp64Milli(ts) AS ts,
          toString(open) AS open,
          toString(high) AS high,
          toString(low) AS low,
          toString(close) AS close,
          toString(volume) AS volume
        FROM candles
        WHERE exchange = {exchange:String}
          AND symbol = {symbol:String}
          AND interval = {interval:String}
          ${whereRange}
        ORDER BY ts ASC
        LIMIT {limit:UInt32}
        OFFSET {cursor:UInt32}
      `,
      format: "JSONEachRow",
      query_params: {
        exchange: q.exchange,
        symbol: q.symbol,
        interval: q.interval,
        limit: q.limit,
        cursor: q.cursor,
        startTs: q.startTs ?? "",
        endTs: q.endTs ?? ""
      }
    });

    const rows = await result.json<ReplayRow>();
    const frames: ReplayFrame[] = rows.map((row, i) => ({
      index: q.cursor + i,
      ts: Number(row.ts),
      open: String(row.open),
      high: String(row.high),
      low: String(row.low),
      close: String(row.close),
      volume: String(row.volume)
    }));

    return {
      cursor: q.cursor,
      nextCursor: q.cursor + frames.length,
      limit: q.limit,
      done: frames.length < q.limit,
      frames
    };
  }
}
