# Phase 2 — Storage, Replay, Scanner, Alerts, Heatmap Pipeline

## Summary

Phase 2 upgrades the read-only live market-data spine into a durable product foundation.

It adds:

- Batched ClickHouse persistence for normalized trades, book levels, and candles
- Replay session and replay candle API scaffolding
- Redis-backed live heatmap tile cache
- Liquidity wall scanner worker
- Runtime alert worker for price-cross alerts
- Frontend scanner panel
- Frontend live heatmap panel
- Additional unit tests

## Scope boundary

This is still read-only. It does not place trades, custody assets, manage wallets, or deploy production token/liquidity contracts.

## Start commands

```bash
docker compose up -d postgres redis clickhouse

# Apply ClickHouse schema
cat db/clickhouse/schema.sql | docker exec -i $(docker compose ps -q clickhouse) clickhouse-client --multiquery

cd services/api
npm install
npm run test
npm run dev

cd ../../apps/web
npm install
npm run dev
```

## Acceptance checks

1. `/health` returns ok.
2. `/v1/ws/stats` returns client/subscription stats.
3. Hyperliquid and dYdX adapters connect without crashing.
4. ClickHouse writer logs batch inserts or clear insert errors.
5. `/v1/heatmap/latest?exchange=hyperliquid&symbol=BTC-USD` returns a tile after book data arrives.
6. Scanner panel receives large liquidity wall signals.
7. Replay routes return valid response shapes.

## Next patch

Phase 3 should add historical backfill, true replay playback, backtesting runner, level engine integration, and WebGL heatmap rendering.
