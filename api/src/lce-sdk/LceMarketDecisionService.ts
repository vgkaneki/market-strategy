import { clickhouse } from "../clickhouse/client.js";
import type { Candle } from "../levels/types.js";
import { LceDataMapper } from "./LceDataMapper.js";
import { LceSdkLoader } from "./LceSdkLoader.js";

type StoredCandleRow = {
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export class LceMarketDecisionService {
  private readonly loader = new LceSdkLoader();
  private readonly mapper = new LceDataMapper();

  status() {
    return this.loader.status();
  }

  async engines() {
    const sdk = await this.loader.load();
    return {
      requiredEngineIds: sdk.engines.REQUIRED_ENGINE_IDS,
      registeredEngineIds: sdk.engines.getRegisteredEngineIds?.() ?? [],
      manifest: sdk.manifest
    };
  }

  async decideFromInputs(input: {
    symbol: string;
    timeframe?: string;
    candles?: Candle[] | any[];
    book?: any;
    trades?: any[];
    dataHealth?: any;
    forwardProof?: any;
  }) {
    const sdk = await this.loader.load();
    const symbol = this.mapper.toSdkSymbol(input.symbol);
    const timeframe = input.timeframe ?? "1m";
    const candles = this.mapper.toSdkCandles(input.candles ?? []);
    const book = this.mapper.toSdkBook(input.book);
    const trades = this.mapper.toSdkTrades(input.trades);

    const lastPrice =
      candles.at(-1)?.close ??
      trades.at(-1)?.price ??
      book?.bids?.[0]?.[0] ??
      book?.asks?.[0]?.[0] ??
      0;

    const decision = sdk.marketDecision.decideMarket({
      symbol,
      timeframe,
      candles,
      book,
      trades,
      lastPrice,
      dataHealth: input.dataHealth,
      forwardProof: input.forwardProof
    });

    return this.normalizeDecision(decision);
  }

  async decideFromStored(input: {
    exchange: string;
    symbol: string;
    interval: string;
    lookback: number;
  }) {
    const candles = await this.loadCandles(input);
    return this.decideFromInputs({
      symbol: input.symbol,
      timeframe: input.interval,
      candles,
      dataHealth: { overall: candles.length > 50 ? "healthy" : "low-quality" }
    });
  }

  async validateForward(input: {
    symbol: string;
    timeframe: string;
    candles: any[];
    ratio?: number;
  }) {
    const sdk = await this.loader.load();
    const candles = this.mapper.toSdkCandles(input.candles);
    const split = sdk.validation.splitFormationHoldout(candles, input.ratio ?? 0.7);
    const engine = sdk.core.createLceEngine({
      symbols: [input.symbol],
      timeframes: [input.timeframe],
      marketDataOnly: true
    });
    engine.ingestCandles(input.symbol, input.timeframe, split.formation);
    const zones = engine.getZones(input.symbol);
    const noLookahead = sdk.validation.assertNoLookahead({ zones, cutTimeMs: split.cutTimeMs });
    const forward = sdk.validation.validateForwardTouches({ zones, holdoutCandles: split.holdout });
    return { split: { cutTimeMs: split.cutTimeMs, formation: split.formation.length, holdout: split.holdout.length }, noLookahead, forward };
  }

  private normalizeDecision(decision: any) {
    return {
      ...decision,
      marketDataOnly: decision?.marketDataOnly === true,
      noOrderExecution: decision?.noOrderExecution === true,
      source: "locked-lce-sdk"
    };
  }

  private async loadCandles(input: {
    exchange: string;
    symbol: string;
    interval: string;
    lookback: number;
  }): Promise<Candle[]> {
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
        exchange: input.exchange,
        symbol: input.symbol,
        interval: input.interval,
        limit: input.lookback
      }
    });

    const rows = await result.json<StoredCandleRow>();
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
