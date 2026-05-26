import { clickhouse } from "../clickhouse/client.js";
import type { Candle } from "../levels/types.js";
import { LevelEngineRegistry } from "../levels/LevelEngineRegistry.js";

export interface ReplayOverlay {
  id: string;
  type: "level";
  engine: string;
  side: string;
  price: string;
  startTs: number;
  endTs?: number;
  strength: number;
  confidence: number;
  label: string;
}

type Row = {
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export class ReplayOverlayService {
  constructor(private readonly registry = new LevelEngineRegistry()) {}

  async generate(input: {
    exchange: string;
    symbol: string;
    interval: string;
    lookback: number;
    engineIds?: string[];
  }): Promise<ReplayOverlay[]> {
    const candles = await this.loadCandles(input.exchange, input.symbol, input.interval, input.lookback);
    const levels = this.registry.generateAll({
      symbol: input.symbol,
      timeframe: input.interval,
      candles
    }, input.engineIds);

    return levels.slice(-300).map((level) => ({
      id: level.id,
      type: "level",
      engine: level.engine,
      side: level.side,
      price: level.price,
      startTs: level.createdAt,
      strength: level.strength,
      confidence: level.confidence,
      label: `${level.engine} ${level.side} ${level.price}`
    }));
  }

  private async loadCandles(exchange: string, symbol: string, interval: string, limit: number): Promise<Candle[]> {
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
        ORDER BY ts DESC
        LIMIT {limit:UInt32}
      `,
      format: "JSONEachRow",
      query_params: { exchange, symbol, interval, limit }
    });

    const rows = await result.json<Row>();
    return rows.map((row) => ({
      ts: Number(row.ts),
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume
    })).reverse();
  }
}
