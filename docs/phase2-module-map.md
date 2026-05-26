# Phase 2 Module Map

## Storage

| Module | Purpose |
|---|---|
| `clickhouse/client.ts` | ClickHouse client config |
| `market/MarketDataStore.ts` | Batched inserts for trades/book/candles |
| `db/clickhouse/schema.sql` | Market, heatmap, replay, alert tables |

## Replay

| Module | Purpose |
|---|---|
| `replay/ReplayService.ts` | Replay session + candle query service |
| `routes/replay.ts` | Replay HTTP endpoints |

## Heatmap

| Module | Purpose |
|---|---|
| `heatmap/HeatmapTileCache.ts` | Live book levels to bucketed heatmap tile |
| `routes/heatmap.ts` | Latest heatmap tile API |
| `components/HeatmapPanel.tsx` | Frontend live canvas renderer |

## Scanners

| Module | Purpose |
|---|---|
| `scanners/LiquidityWallScanner.ts` | Detects large bid/ask resting liquidity |
| `scanners/ScannerWorker.ts` | Runs scanner on live book events |
| `components/ScannerPanel.tsx` | Frontend scanner output panel |

## Alerts

| Module | Purpose |
|---|---|
| `alerts/AlertWorker.ts` | Runtime evaluator for price-cross alerts |
| `routes/alerts.ts` | Create/list alert rules and alert events |
| `prisma/schema.prisma` | AlertEvent and ReplaySession models |
