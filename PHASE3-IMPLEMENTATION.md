# Phase 3 — Replay Playback, Backtesting, Level Engines, WebGL Heatmap

## Summary

Phase 3 upgrades the product from "live market-data dashboard" into a serious analytics/research platform.

It adds:

- Replay playback service
- Replay frame API
- Backtesting service
- Reversal/level reaction backtester
- Level engine plugin registry
- Built-in swing pivot level engine
- Built-in liquidity sweep level engine
- Backtest API route
- Replay page and controls
- Backtest dashboard panel
- WebGL heatmap renderer
- Additional unit tests
- Phase 3 runbook and module map

## Scope boundary

This phase remains **analytics-only**.

It does not:
- Execute trades
- Connect exchange API keys for order placement
- Custody assets
- Sign transactions
- Manage money
- Promise win rate or profit

## Why Phase 3 matters

A crypto trading terminal becomes valuable when it can prove whether its levels are useful.

Phase 3 begins that proof layer:

```text
Historical candles
    ↓
Level engines
    ↓
Touch/reaction simulation
    ↓
Win/reaction statistics
    ↓
Replay visual confirmation
```

## Main acceptance criteria

1. API starts.
2. `/v1/backtest/run` returns a structured backtest report.
3. `/v1/replay/frames` returns candle batches for replay.
4. Built-in level engines produce chart-displayable levels.
5. Backtester avoids lookahead by only using levels created before each tested candle.
6. Web dashboard includes replay route.
7. Web dashboard includes backtest report panel.
8. Heatmap can render GPU/WebGL-style from live tile buckets.

## Recommended run order

```bash
docker compose up -d postgres redis clickhouse

# Apply ClickHouse schema:
cat db/clickhouse/schema.sql | docker exec -i $(docker compose ps -q clickhouse) clickhouse-client --multiquery

cd services/api
npm install
npm run test
npm run dev

cd ../../apps/web
npm install
npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/replay
```

## Next phase

Phase 4 should add:

1. Real historical backfill workers.
2. Multi-timeframe level confluence.
3. Persistent backtest reports.
4. Replay overlays for generated levels.
5. Alert delivery providers.
6. Scanner signal persistence.
7. More realistic slippage/spread assumptions.
8. UI to choose symbols/timeframes/date ranges.
