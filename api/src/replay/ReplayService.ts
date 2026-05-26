import { randomUUID } from "node:crypto";
import { clickhouse } from "../clickhouse/client.js";

export interface CreateReplaySessionInput {
  exchange: string;
  symbol: string;
  timeframe: string;
  startTs: string;
  endTs: string;
  name?: string;
  userId?: string;
}

export class ReplayService {
  async createSession(input: CreateReplaySessionInput) {
    const id = randomUUID();
    await clickhouse.insert({
      table: "replay_sessions",
      format: "JSONEachRow",
      values: [{
        id, created_at: new Date().toISOString().replace("Z", ""),
        exchange: input.exchange, symbol: input.symbol, timeframe: input.timeframe,
        start_ts: input.startTs.replace("Z", ""), end_ts: input.endTs.replace("Z", ""),
        metadata: JSON.stringify({ name: input.name ?? `${input.symbol} ${input.timeframe} replay`, userId: input.userId ?? null })
      }]
    });
    return { id, status: "created", ...input };
  }

  async getCandles(exchange: string, symbol: string, interval: string, startTs: string, endTs: string, limit = 5000) {
    const result = await clickhouse.query({
      query: `
        SELECT toUnixTimestamp64Milli(ts) AS ts, open, high, low, close, volume
        FROM candles
        WHERE exchange = {exchange:String}
          AND symbol = {symbol:String}
          AND interval = {interval:String}
          AND ts >= parseDateTime64BestEffort({startTs:String})
          AND ts <= parseDateTime64BestEffort({endTs:String})
        ORDER BY ts ASC
        LIMIT {limit:UInt32}
      `,
      format: "JSONEachRow",
      query_params: { exchange, symbol, interval, startTs, endTs, limit }
    });
    return result.json();
  }
}
