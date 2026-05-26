# Phase 4 — Historical Backfill, Multi-Timeframe Confluence, Persistent Reports, Replay Overlays

## Summary

Phase 4 turns Phase 3 into a more complete research platform:

- Historical candle backfill for Hyperliquid and dYdX
- Backfill job service and REST API
- Candle store with safe batched inserts
- Multi-timeframe confluence scoring
- Stronger validation metrics
- Persistent backtest report storage
- Replay overlay generation for chart levels and confluence zones
- Report listing/detail APIs
- Frontend Backfill, Reports, Confluence, and Overlay panels
- More unit tests

## Scope boundary

Still analytics-only.

No:
- Order placement
- Custody
- Exchange API keys
- Funds management
- Smart contract deployment automation
- Profit guarantees

## Phase 4 architecture

```text
Vendor historical candles
    ↓
Backfill clients
    ↓
CandleBackfillService
    ↓
ClickHouse candles table
    ↓
BacktestService + LevelEngineRegistry
    ↓
ConfluenceService + ValidationMetrics
    ↓
Persistent BacktestReportStore
    ↓
Replay overlays + reports dashboard
```

## Acceptance criteria

1. API exposes `/v1/backfill/run`.
2. API exposes `/v1/backfill/status`.
3. API exposes `/v1/reports`.
4. API exposes `/v1/reports/:id`.
5. API exposes `/v1/confluence/run`.
6. API exposes `/v1/replay/overlays`.
7. Backtest reports can be persisted to ClickHouse.
8. Confluence zones are derived from multi-timeframe levels.
9. Replay overlays are chart-displayable.
10. Frontend has pages/panels for backfill, reports, confluence, and overlays.

## Run commands

```bash
docker compose up -d postgres redis clickhouse

# macOS/Linux
bash scripts/apply-clickhouse-schema.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/apply-clickhouse-schema.ps1

cd services/api
npm install
npm run test
npm run dev

cd ../../apps/web
npm install
npm run dev
```

## Manual endpoint checks

```bash
curl "http://localhost:8787/v1/backfill/status"

curl -X POST "http://localhost:8787/v1/backfill/run" \
  -H "Content-Type: application/json" \
  -d '{"exchange":"hyperliquid","symbol":"BTC-USD","interval":"1m","startTs":"2026-05-24T00:00:00.000Z","endTs":"2026-05-24T01:00:00.000Z"}'

curl "http://localhost:8787/v1/backtest/run?exchange=hyperliquid&symbol=BTC-USD&interval=1m&lookback=1000&persist=true"

curl "http://localhost:8787/v1/confluence/run?exchange=hyperliquid&symbol=BTC-USD"

curl "http://localhost:8787/v1/replay/overlays?exchange=hyperliquid&symbol=BTC-USD&interval=1m&lookback=1000"
```

## Next phase

Phase 5 should add:

- Full source health dashboard
- Data-quality scoring per exchange/symbol/timeframe
- Level-by-level ranking report
- Walk-forward validation windows
- Monte Carlo / bootstrapped confidence intervals
- Forward-test capture mode
- Exportable HTML/PDF reports
- UI configuration for all engine parameters
