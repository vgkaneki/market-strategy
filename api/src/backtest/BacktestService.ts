import { clickhouse } from "../clickhouse/client.js";
import { config } from "../config.js";
import type { Candle } from "../levels/types.js";
import { LevelEngineRegistry } from "../levels/LevelEngineRegistry.js";
import { ReversalBacktester } from "./ReversalBacktester.js";
import type { BacktestReport, BacktestRequest } from "./types.js";
import { ValidationMetrics } from "../validation/ValidationMetrics.js";

type CandleRow = {
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export class BacktestService {
  constructor(
    private readonly registry = new LevelEngineRegistry(),
    private readonly backtester = new ReversalBacktester()
  ) {}

  listEngines() {
    return this.registry.list();
  }

  async run(input: Partial<BacktestRequest>): Promise<BacktestReport> {
    const request: BacktestRequest = {
      exchange: input.exchange ?? "hyperliquid",
      symbol: input.symbol ?? "BTC-USD",
      interval: input.interval ?? "1m",
      lookback: Math.min(Number(input.lookback ?? 1000), config.BACKTEST_MAX_CANDLES),
      reactionBars: Number(input.reactionBars ?? 20),
      reactionBps: Number(input.reactionBps ?? 25),
      maxDistanceBps: Number(input.maxDistanceBps ?? 5),
      engineIds: input.engineIds
    };

    const candles = await this.loadRecentCandles(request);
    const levels = this.registry.generateAll({
      symbol: request.symbol,
      timeframe: request.interval,
      candles
    }, request.engineIds);

    const report = this.backtester.run(request, candles, levels);
    return { ...report, metrics: new ValidationMetrics().compute(report) } as BacktestReport & { metrics: unknown };
  }

  private async loadRecentCandles(request: BacktestRequest): Promise<Candle[]> {
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
      query_params: {
        exchange: request.exchange,
        symbol: request.symbol,
        interval: request.interval,
        limit: request.lookback
      }
    });

    const rows = await result.json<CandleRow>();
    return rows
      .map((row) => ({
        ts: Number(row.ts),
        open: String(row.open),
        high: String(row.high),
        low: String(row.low),
        close: String(row.close),
        volume: String(row.volume)
      }))
      .reverse();
  }
}
