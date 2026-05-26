# Phase 4 Module Map

## Backfill

| File | Purpose |
|---|---|
| `services/api/src/backfill/types.ts` | Shared backfill/candle interfaces |
| `services/api/src/backfill/intervals.ts` | Internal ↔ vendor interval mapping |
| `services/api/src/backfill/HyperliquidCandleClient.ts` | Hyperliquid candleSnapshot client |
| `services/api/src/backfill/DydxCandleClient.ts` | dYdX candle API client |
| `services/api/src/backfill/CandleStore.ts` | Batched candle inserts |
| `services/api/src/backfill/CandleBackfillService.ts` | Job orchestration |
| `services/api/src/routes/backfill.ts` | Backfill API |

## Reports

| File | Purpose |
|---|---|
| `services/api/src/reports/BacktestReportStore.ts` | Persist/list/read reports |
| `services/api/src/routes/reports.ts` | Report API |
| `apps/web/components/ReportsPanel.tsx` | Report UI |

## Confluence

| File | Purpose |
|---|---|
| `services/api/src/confluence/types.ts` | Confluence zone types |
| `services/api/src/confluence/MultiTimeframeConfluenceService.ts` | Groups nearby levels across timeframes |
| `services/api/src/routes/confluence.ts` | Confluence API |
| `apps/web/components/ConfluencePanel.tsx` | Confluence UI |

## Replay overlays

| File | Purpose |
|---|---|
| `services/api/src/replay/ReplayOverlayService.ts` | Builds chart overlays from generated levels |
| `services/api/src/routes/replay.ts` | Adds `/v1/replay/overlays` |
| `apps/web/components/ReplayOverlayPanel.tsx` | Overlay UI |

## Metrics

| File | Purpose |
|---|---|
| `services/api/src/validation/ValidationMetrics.ts` | Stronger backtest statistics |
| `services/api/tests/validation-metrics.test.ts` | Unit tests |
