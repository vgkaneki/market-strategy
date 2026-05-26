# Comprehensive Architecture Blueprint

## 1. Product boundaries

The safest and strongest product path is:

1. **Read-only market-data platform first**
   - Charts
   - Orderbooks
   - DOM
   - Liquidity heatmaps
   - Volume/tape
   - Technical analysis
   - Screeners/scanners
   - Alerts
   - Replay/backtesting
   - Mobile read-only companion

2. **Non-custodial trading second**
   - User connects wallet.
   - User signs orders/transactions.
   - Platform never stores user private keys.

3. **Custodial/wallet/token/liquidity services last**
   - Requires legal review, KYC/AML, custody policy, audits, insurance, and operational controls.

## 2. System diagram

```text
                                  ┌──────────────────────────┐
                                  │  Cloudflare / WAF / CDN  │
                                  └─────────────┬────────────┘
                                                │
                         ┌──────────────────────┴──────────────────────┐
                         │                                             │
                ┌────────▼────────┐                           ┌────────▼────────┐
                │  Next.js Web    │                           │ React Native    │
                │  Dashboard      │                           │ Mobile App      │
                └────────┬────────┘                           └────────┬────────┘
                         │ REST/WebSocket/SSE                          │
                ┌────────▼──────────────────────────────────────────────▼────────┐
                │                   API / BFF Layer                              │
                │ Fastify, auth, alerts, KYC, user settings, WS fanout           │
                └────────┬─────────────────────┬───────────────────────┬────────┘
                         │                     │                       │
             ┌───────────▼──────────┐ ┌────────▼────────┐  ┌──────────▼──────────┐
             │ Redis / Redpanda     │ │ PostgreSQL      │  │ ClickHouse/QuestDB  │
             │ event bus/cache      │ │ users/config    │  │ market time-series  │
             └───────────▲──────────┘ └─────────────────┘  └──────────▲──────────┘
                         │                                             │
                ┌────────▼──────────────────────────────────────────────┴───────┐
                │             Market Data Ingestion Layer                       │
                │ Rust/Go adapters, normalization, sequencing, health scoring   │
                └────────┬─────────────────────┬───────────────────────┬───────┘
                         │                     │                       │
              ┌──────────▼─────────┐ ┌─────────▼─────────┐ ┌──────────▼─────────┐
              │ Hyperliquid WS/API │ │ dYdX v4 WS/API    │ │ RPC / nodes / LPs  │
              └────────────────────┘ └───────────────────┘ └────────────────────┘
```

## 3. Service modules

### 3.1 Market ingestion service

Preferred language: **Rust**.

Responsibilities:

- Maintain vendor WebSocket connections.
- Normalize exchange-specific messages into common event types.
- Sequence events.
- Drop or quarantine stale/out-of-order events.
- Produce stream events into Redis Streams or Redpanda.
- Write tick/candle/orderbook data into ClickHouse/QuestDB.
- Expose health metrics.

Normalized event types:

```text
trade
book_delta
book_snapshot
candle
funding
open_interest
liquidation
exchange_status
```

### 3.2 Backend API/BFF

Preferred language: **Node.js TypeScript + Fastify**.

Responsibilities:

- User auth/session management.
- Alert rules.
- Watchlists.
- Scanner configs.
- KYC workflow wrappers.
- REST API for historical data.
- WebSocket fanout to clients.
- Rate limits and abuse controls.
- Audit logging.

### 3.3 Frontend dashboard

Preferred stack:

- Next.js App Router
- React
- TypeScript
- lightweight-charts for candles
- PixiJS/WebGL or Canvas for heatmaps
- Zustand for local UI state
- TanStack Query for API queries
- Reown AppKit for WalletConnect-style wallet connection
- Tailwind CSS + shadcn/ui

### 3.4 Mobile

Preferred stack:

- React Native / Expo
- Read-only alerts/watchlist/chart snapshot first
- Native push notifications
- Trading disabled until compliance and safety are proven

### 3.5 Smart contracts

Preferred stack:

- Solidity `^0.8.24`
- OpenZeppelin Contracts 5.x
- Hardhat or Foundry
- Safe multisig as owner/admin
- Timelock for critical admin changes

Contracts in this starter:

- `MarketStrategyToken.sol`
- `LiquidityTreasury.sol`

Production contracts should be audited before deployment.

## 4. WebSocket architecture

### Client subscriptions

Client sends:

```json
{
  "type": "subscribe",
  "channel": "book",
  "symbol": "BTC-USD",
  "exchange": "hyperliquid"
}
```

Server replies:

```json
{
  "type": "subscribed",
  "channel": "book",
  "symbol": "BTC-USD",
  "exchange": "hyperliquid"
}
```

Market event format:

```json
{
  "type": "book_delta",
  "exchange": "hyperliquid",
  "symbol": "BTC-USD",
  "ts": 1760000000000,
  "seq": 123456,
  "bids": [["65000.0", "1.25"]],
  "asks": [["65001.0", "0.80"]]
}
```

### Important WebSocket controls

- Heartbeat every 10-20 seconds.
- Client pong timeout.
- Max subscriptions per user.
- Max connections per IP.
- Server-side fanout batching once per animation frame for UI streams.
- Backpressure detection.
- Lossy aggregation for heatmap UI.
- Lossless storage path for replay/backtesting.

## 5. Database split

### PostgreSQL

Use for:

- Users
- Sessions
- Roles
- KYC status
- Alert rules
- Watchlists
- Billing
- Audit logs
- API keys metadata

### ClickHouse / QuestDB

Use for:

- Trades
- Book deltas
- Candles
- Funding
- Liquidations
- Scanner signal history
- Liquidity levels
- Replay snapshots

### Redis / Redpanda

Use for:

- Live stream fanout
- Fast latest-book cache
- Rate limit counters
- Alert evaluation queues
- Event bus

## 6. Latency model

Target internal budgets for read-only market data:

| Stage | Target |
|---|---:|
| Vendor WS receive -> normalize | < 2 ms |
| Normalize -> stream bus | < 2 ms |
| Stream bus -> backend fanout | < 5 ms |
| Backend -> browser socket | < 20-80 ms network-dependent |
| Browser render batch | 16-33 ms |
| Total perceived live delay | 50-250 ms typical |

For real HFT order execution, browser-based retail UI is not enough. Execution engines should run server-side or co-located, with strict legal/vendor approval.

## 7. Recommended deployment topology

### Local/dev

- Docker Compose
- PostgreSQL
- Redis
- ClickHouse
- Node API
- Next.js app

### Production

- Cloudflare
- Kubernetes or ECS/Fargate
- Separate market ingestion pods per venue
- Managed PostgreSQL
- Managed ClickHouse/QuestDB
- Redis Cluster or Redpanda
- Secrets manager
- OpenTelemetry collector
- Grafana/Prometheus/Loki
- Blue/green deploys

## 8. Build order

1. Market-data adapter interfaces.
2. Hyperliquid WebSocket ingestion.
3. dYdX WebSocket ingestion.
4. Normalized event schema.
5. ClickHouse schema.
6. WebSocket fanout to browser.
7. Chart/orderbook/DOM/heatmap.
8. Scanner engine.
9. Alert engine.
10. Replay/backtest storage.
11. User auth.
12. KYC integration.
13. Non-custodial wallet connection.
14. Smart contract testnet deployment.
15. External audit.
