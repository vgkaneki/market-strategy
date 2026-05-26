# Phase 4 Runbook

## Goal

Make the platform capable of filling historical candle data, running stronger level validation, persisting reports, and displaying replay overlays.

## Backfill flow

1. Request backfill.
2. Vendor client fetches candles.
3. CandleBackfillService normalizes rows.
4. CandleStore inserts into ClickHouse.
5. Backfill job status is updated in memory.
6. UI can rerun tests using the newly filled data.

## Important limitations

- Hyperliquid only exposes recent candle history through `candleSnapshot`.
- dYdX candle API resolution names are different from the internal names.
- Phase 4 uses in-memory backfill job status; production should persist job state.
- Backfill is designed for candles, not full order book history.
- Tick/orderbook historical backfill requires specialized archive sources.

## Safe testing sequence

1. Apply schema.
2. Run tests.
3. Start API.
4. Backfill 1 hour of BTC 1m data.
5. Run backtest.
6. Persist report.
7. Open reports page.
8. Open replay page and verify overlays.

## Bugs to watch for

- Duplicate candles if ReplacingMergeTree key is wrong.
- Interval mismatch: `1m` vs `1MIN`.
- Time range too wide for provider limits.
- Empty vendor response but successful HTTP status.
- Decimal values returned as strings.
- Confluence grouping nearby levels too tightly or too loosely.
- Reports storing huge candle arrays.
- UI trying to render thousands of overlays at once.
