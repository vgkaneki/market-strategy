# Phase 1 Runbook

## Goal

Get reliable real-time market data from Hyperliquid and dYdX into the dashboard.

## Start order

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

## Manual checks

### Backend health

```bash
curl http://localhost:8787/health
```

Expected:

```json
{"ok":true,"service":"market-strategy-api"}
```

### WebSocket stats

```bash
curl http://localhost:8787/v1/ws/stats
```

Expected fields:

```json
{"clients":0,"ips":0,"subscriptions":0}
```

### Browser

Open:

```text
http://localhost:3000
```

Expected:

- Chart appears.
- Order book panel shows Live if WebSocket connected.
- Tape panel updates when Hyperliquid trades arrive.
- API terminal logs show Hyperliquid/dYdX connected.

## Troubleshooting

### No live data

Check:

1. API terminal logs.
2. Browser console.
3. Firewall/VPN blocking WebSocket.
4. Vendor endpoint availability.
5. `.env` WebSocket URLs.

### UI live but no book rows

Likely cause:

- Vendor message format changed.
- Normalizer needs patching.
- Symbol mapping mismatch.

Files to check:

```text
services/api/src/market/normalizers/hyperliquid.ts
services/api/src/market/normalizers/dydx.ts
services/api/src/market/symbols.ts
```

### High CPU

Likely cause:

- Too many UI updates.
- Heatmap drawing too often.
- WebSocket flood.

Fix order:

1. Batch backend fanout.
2. Batch frontend state updates.
3. Move heatmap rendering to canvas/Web Worker.
4. Add server-side aggregation.
