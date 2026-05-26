# Phase 1 — Market Data Spine Implementation Patch

This patch upgrades the starter blueprint into a clearer Phase 1 market-data spine.

## What this phase adds

- Normalized market event schemas
- Exchange symbol mapping
- Hyperliquid message normalization
- dYdX message normalization
- In-memory order book engine
- Safer WebSocket subscription routing
- Redis pub/sub bridge
- ClickHouse writer scaffold
- Live frontend WebSocket hook
- Dashboard panels wired for live updates
- API edge-case tests
- Phase 1 runbook

## Scope

This phase is **read-only**. It does not place trades, manage funds, or custody assets.

## Recommended acceptance criteria

1. Backend starts cleanly.
2. Frontend connects to `/v1/ws`.
3. Client can subscribe to:
   - `hyperliquid:book:BTC`
   - `hyperliquid:trades:BTC`
   - `dydx:book:BTC-USD`
   - `dydx:trades:BTC-USD`
4. Backend does not crash on unknown vendor messages.
5. WebSocket heartbeat removes dead clients.
6. UI updates are batched and do not re-render every single tick.
7. Order book stores price levels as strings/integers, never unsafe floating-point math for core state.

## Commands

```bash
docker compose up -d postgres redis clickhouse

cd services/api
npm install
npm run test
npm run dev

cd ../../apps/web
npm install
npm run dev
```

## What to build next

After this patch is working:

1. Real ClickHouse inserts for normalized trades/candles/book deltas.
2. Market replay API.
3. Alert engine worker.
4. Scanner engine worker.
5. Heatmap tile cache.
6. Backtest/replay UI.
