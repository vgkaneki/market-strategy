# Phase 1 Module Map

## API modules

| Module | Purpose |
|---|---|
| `market/types.ts` | Normalized event interfaces |
| `market/symbols.ts` | Canonical ↔ venue symbol conversion |
| `market/normalizers/hyperliquid.ts` | Hyperliquid raw message normalization |
| `market/normalizers/dydx.ts` | dYdX raw message normalization |
| `market/OrderBook.ts` | In-memory order book state |
| `market/MarketEventBus.ts` | Internal event emitter |
| `market/ClickHouseWriter.ts` | Batched persistence scaffold |
| `services/ws/MarketStreamHub.ts` | Client WebSocket subscription/fanout |
| `services/ws/HyperliquidAdapter.ts` | Hyperliquid connection/subscriptions |
| `services/ws/DydxAdapter.ts` | dYdX connection/subscriptions |

## Frontend modules

| Module | Purpose |
|---|---|
| `hooks/useMarketSocket.ts` | Live WebSocket subscription hook |
| `components/LiveStatus.tsx` | Connection status indicator |
| `components/ChartPanel.tsx` | Candle chart with live updates |
| `components/OrderBookPanel.tsx` | Live top-of-book display |
| `components/TapePanel.tsx` | Live trades/volume tape |
| `components/HeatmapPanel.tsx` | Canvas heatmap placeholder |

## Tests

| Test file | Coverage |
|---|---|
| `normalizers.test.ts` | Vendor message normalization |
| `orderbook.test.ts` | Book snapshot/delta behavior |
| `health.test.ts` | Test harness sanity |
