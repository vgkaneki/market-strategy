import type { ChartLevel, LevelEngine, LevelEngineContext } from "../types.js";

function level(
  engine: string,
  context: LevelEngineContext,
  index: number,
  side: ChartLevel["side"],
  price: string,
  strength = 50,
  metadata: Record<string, unknown> = {}
): ChartLevel {
  const candle = context.candles[index];
  return {
    id: `${engine}:${context.symbol}:${context.timeframe}:${side}:${candle.ts}:${price}`,
    engine,
    symbol: context.symbol,
    timeframe: context.timeframe,
    side,
    price,
    createdAt: candle.ts,
    strength,
    confidence: Math.min(0.85, 0.45 + strength / 250),
    metadata
  };
}

abstract class SimpleCatalogEngine implements LevelEngine {
  abstract id: string;
  abstract label: string;
  minCandles = 50;
  abstract generate(context: LevelEngineContext): ChartLevel[];
}

export class EqualHighLiquidityEngine extends SimpleCatalogEngine {
  id = "equal_high_liquidity";
  label = "Equal High Liquidity";

  generate(context: LevelEngineContext) {
    const out: ChartLevel[] = [];
    for (let i = 10; i < context.candles.length; i++) {
      const h = Number(context.candles[i].high);
      const prior = context.candles.slice(Math.max(0, i - 10), i);
      if (prior.some((c) => Math.abs(Number(c.high) - h) / h * 10000 <= 5)) {
        out.push(level(this.id, context, i, "supply", context.candles[i].high, 65));
      }
    }
    return out.slice(-100);
  }
}

export class EqualLowLiquidityEngine extends SimpleCatalogEngine {
  id = "equal_low_liquidity";
  label = "Equal Low Liquidity";

  generate(context: LevelEngineContext) {
    const out: ChartLevel[] = [];
    for (let i = 10; i < context.candles.length; i++) {
      const l = Number(context.candles[i].low);
      const prior = context.candles.slice(Math.max(0, i - 10), i);
      if (prior.some((c) => Math.abs(Number(c.low) - l) / l * 10000 <= 5)) {
        out.push(level(this.id, context, i, "demand", context.candles[i].low, 65));
      }
    }
    return out.slice(-100);
  }
}

export class FairValueGapMidEngine extends SimpleCatalogEngine {
  id = "fair_value_gap_mid";
  label = "Fair Value Gap Mid";

  generate(context: LevelEngineContext) {
    const out: ChartLevel[] = [];
    for (let i = 2; i < context.candles.length; i++) {
      const a = context.candles[i - 2];
      const c = context.candles[i];
      if (Number(a.high) < Number(c.low)) {
        out.push(level(this.id, context, i, "demand", String((Number(a.high) + Number(c.low)) / 2), 58));
      }
      if (Number(a.low) > Number(c.high)) {
        out.push(level(this.id, context, i, "supply", String((Number(a.low) + Number(c.high)) / 2), 58));
      }
    }
    return out.slice(-100);
  }
}

export class RangeHighLiquidityEngine extends SimpleCatalogEngine {
  id = "range_high_liquidity";
  label = "Range High Liquidity";
  generate(context: LevelEngineContext) {
    if (context.candles.length < 50) return [];
    const out: ChartLevel[] = [];
    for (let i = 50; i < context.candles.length; i += 10) {
      const window = context.candles.slice(i - 50, i);
      const high = Math.max(...window.map((c) => Number(c.high)));
      out.push(level(this.id, context, i, "supply", String(high), 55));
    }
    return out.slice(-100);
  }
}

export class RangeLowLiquidityEngine extends SimpleCatalogEngine {
  id = "range_low_liquidity";
  label = "Range Low Liquidity";
  generate(context: LevelEngineContext) {
    if (context.candles.length < 50) return [];
    const out: ChartLevel[] = [];
    for (let i = 50; i < context.candles.length; i += 10) {
      const window = context.candles.slice(i - 50, i);
      const low = Math.min(...window.map((c) => Number(c.low)));
      out.push(level(this.id, context, i, "demand", String(low), 55));
    }
    return out.slice(-100);
  }
}

export class MarketProfilePocEngine extends SimpleCatalogEngine {
  id = "market_profile_poc";
  label = "Market Profile POC";
  generate(context: LevelEngineContext) {
    const out: ChartLevel[] = [];
    for (let i = 100; i < context.candles.length; i += 25) {
      const window = context.candles.slice(i - 100, i);
      const weighted = window.reduce((sum, c) => sum + Number(c.close) * Number(c.volume || "1"), 0);
      const volume = window.reduce((sum, c) => sum + Number(c.volume || "1"), 0);
      out.push(level(this.id, context, i, "support", String(weighted / Math.max(1, volume)), 62));
    }
    return out.slice(-100);
  }
}

export class VwapClampEngine extends SimpleCatalogEngine {
  id = "tape_vwap_clamped";
  label = "Tape VWAP Clamped";
  generate(context: LevelEngineContext) {
    const out: ChartLevel[] = [];
    for (let i = 30; i < context.candles.length; i += 15) {
      const window = context.candles.slice(i - 30, i);
      const pv = window.reduce((sum, c) => sum + Number(c.close) * Number(c.volume || "1"), 0);
      const v = window.reduce((sum, c) => sum + Number(c.volume || "1"), 0);
      out.push(level(this.id, context, i, "support", String(pv / Math.max(1, v)), 50));
    }
    return out.slice(-100);
  }
}

export class QuantileBandEngine extends SimpleCatalogEngine {
  id = "quantile_band";
  label = "Quantile Band";
  generate(context: LevelEngineContext) {
    const out: ChartLevel[] = [];
    for (let i = 100; i < context.candles.length; i += 25) {
      const closes = context.candles.slice(i - 100, i).map((c) => Number(c.close)).sort((a, b) => a - b);
      out.push(level(this.id, context, i, "demand", String(closes[Math.floor(closes.length * 0.2)]), 52));
      out.push(level(this.id, context, i, "supply", String(closes[Math.floor(closes.length * 0.8)]), 52));
    }
    return out.slice(-100);
  }
}

export class PlaceholderOrderflowEngine extends SimpleCatalogEngine {
  constructor(public id: string, public label: string, public side: ChartLevel["side"] = "support") {
    super();
  }

  generate(context: LevelEngineContext) {
    // DOM/tape-specific engines require live order-flow features.
    // They return no levels until order-flow feature snapshots are provided.
    return [];
  }
}

export function createCompleteLevelCatalog(): LevelEngine[] {
  return [
    new EqualHighLiquidityEngine(),
    new EqualLowLiquidityEngine(),
    new FairValueGapMidEngine(),
    new RangeHighLiquidityEngine(),
    new RangeLowLiquidityEngine(),
    new MarketProfilePocEngine(),
    new VwapClampEngine(),
    new QuantileBandEngine(),

    new PlaceholderOrderflowEngine("absorption", "Absorption Level"),
    new PlaceholderOrderflowEngine("delta_exhaustion", "Delta Exhaustion"),
    new PlaceholderOrderflowEngine("dom_bid_wall", "DOM Bid Wall", "demand"),
    new PlaceholderOrderflowEngine("dom_ask_wall", "DOM Ask Wall", "supply"),
    new PlaceholderOrderflowEngine("iceberg_detection_level", "Iceberg Detection Level"),
    new PlaceholderOrderflowEngine("large_resting_order", "Large Resting Order"),
    new PlaceholderOrderflowEngine("liquidity_heatmap_cluster", "Liquidity Heatmap Cluster"),
    new PlaceholderOrderflowEngine("real_orderbook_wall", "Real Order Book Wall"),
    new PlaceholderOrderflowEngine("resting_liquidity_wall", "Resting Liquidity Wall"),
    new PlaceholderOrderflowEngine("spoof_adjusted_liquidity_wall", "Spoof Adjusted Liquidity Wall"),
    new PlaceholderOrderflowEngine("order_flow_confirmation", "Order Flow Confirmation"),
    new PlaceholderOrderflowEngine("vwoe", "Volume Weighted Orderflow Exhaustion"),
    new PlaceholderOrderflowEngine("gamma_walls", "Gamma Walls"),
    new PlaceholderOrderflowEngine("hvn_liquidity_shelf", "HVN Liquidity Shelf")
  ];
}
