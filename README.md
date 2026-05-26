# Market Strategy Crypto Platform — Phase 1 Starter

This repository is a product-grade starter blueprint for a cryptocurrency analytics/trading terminal with:

- Real-time charting
- Order books
- DOM
- Liquidity heatmaps
- Volume/tape
- Hyperliquid integration
- dYdX integration
- Technical analysis
- Screeners/scanners
- Alerts
- Web dashboard
- Mobile strategy
- Security/compliance blueprint
- Smart contract starter modules
- Tokenomics model
- Database schemas
- DevOps skeleton

## Important status

This is a production-architecture starter, not a finished regulated exchange and not an audited contract package. Before production:

1. Complete legal review for all target jurisdictions.
2. Use non-custodial mode first.
3. Audit all smart contracts.
4. Add external penetration testing.
5. Add real exchange sandbox certification.
6. Add deterministic replay/backtesting validation.
7. Add incident response, monitoring, and disaster recovery.

## Recommended stack

| Layer | Recommended choice |
|---|---|
| Low-latency market ingestion | Rust + Tokio |
| Backend API/BFF | Node.js TypeScript + Fastify |
| Real-time fanout | WebSocket + Redis Streams / Redpanda |
| Market data storage | ClickHouse or QuestDB |
| User/config storage | PostgreSQL |
| Cache/ephemeral state | Redis |
| Frontend | Next.js + React + lightweight-charts + Reown AppKit |
| Mobile | React Native / Expo |
| Smart contracts | Solidity + OpenZeppelin Contracts 5.x + Hardhat |
| Infra | Docker, Kubernetes later, Terraform later |
| Edge protection | Cloudflare WAF/rate limits + API gateway |
| Observability | OpenTelemetry + Prometheus + Grafana + Loki |

## Repository structure

```text
apps/web/                  Next.js dashboard shell
contracts/                 Solidity contracts + Hardhat tests
db/clickhouse/             Time-series market schema
docs/                      Architecture, security, tokenomics, edge cases
packages/shared/           Shared TypeScript types
services/api/              Fastify backend/BFF + KYC + alerts + WS fanout
services/ingestor-rust/    Rust market-data ingestion skeleton
mobile/                    Mobile strategy and Expo starter notes
.github/workflows/         CI starter
docker-compose.yml         Local dev stack
.env.example               Environment template
```

## Local quick start

```bash
cp .env.example .env
docker compose up -d postgres redis clickhouse

cd contracts
npm install
npm test

cd ../services/api
npm install
npm run dev

cd ../../apps/web
npm install
npm run dev
```

## Production progression

Recommended release order:

1. **V0 Local analytics terminal**: read-only market data, charting, orderbook, DOM, heatmap, scanners.
2. **V1 Cloud account system**: users, alerts, watchlists, scanner configs, payments.
3. **V2 Non-custodial trading**: wallet connect, user-signed actions, no platform custody.
4. **V3 Broker/exchange integrations**: only after vendor/legal approvals.
5. **V4 Custody/wallet services**: only after licensing, custody provider, audits, SOC2/security program.
6. **V5 Token/liquidity**: only after audited contracts and legal token review.

## What to build first

Build the market-data spine first:

```text
Exchange WebSockets
  -> Rust/Go ingestion adapters
  -> normalized events
  -> Redis/Redpanda stream
  -> ClickHouse/QuestDB storage
  -> backend fanout
  -> frontend chart/orderbook/DOM/heatmap
```


## Phase 1 patch

See `PHASE1-IMPLEMENTATION.md`, `docs/phase1-runbook.md`, and `docs/phase1-module-map.md`.


## Phase 2 patch

See `PHASE2-IMPLEMENTATION.md` and `docs/phase2-module-map.md`.


## Phase 3 patch

See `PHASE3-IMPLEMENTATION.md`, `docs/phase3-runbook.md`, and `docs/phase3-module-map.md`.

Phase 3 adds replay playback, backtesting, level-engine plugin integration, and a WebGL heatmap renderer.


## Phase 4 patch

See `PHASE4-IMPLEMENTATION.md`, `docs/phase4-runbook.md`, and `docs/phase4-module-map.md`.

Phase 4 adds historical candle backfill, multi-timeframe confluence, persistent backtest reports, replay overlays, and stronger validation metrics.

Open `/research` for the new Phase 4 research dashboard.


## Phase 5 production expansion

See `PHASE5-PRODUCTION-EXPANSION.md`.

Phase 5 adds:

- Production authentication scaffolding
- Custody policy and withdrawal approval workflow scaffolding
- Expo mobile app
- High-density liquidity heatmap engine
- Historical order book capture/replay framework
- Expanded level engine catalog
- Exportable HTML/PDF report services
- Production deployment hardening
- Smart contract audit-prep tooling

Important: custody and smart contracts require professional legal/security/audit review before real funds are involved.


## Phase 6 LCE SDK compatibility

See `PHASE6-LCE-SDK-COMPATIBILITY.md`.

The uploaded `market-strategy-lce-sdk-main.zip` is treated as a locked external source artifact. The platform integrates with it through `services/api/src/lce-sdk/` without modifying the ZIP.

Setup:

```bash
node scripts/install-lce-sdk.mjs
node scripts/verify-lce-sdk.mjs
```

Open:

```text
/lce
```


## Final QA / Render hardening patch

This package includes fixes for:

- reports route syntax
- Prisma auth password hash field
- jsonwebtoken TypeScript declarations
- custom JSX declaration for `w3m-button`
- committed hidden files: `.env.example` and `.github/workflows/ci.yml`
- root scripts and `render.yaml` for Render-safe builds

Recommended local verification:

```bash
npm run verify:local
```


## Final QA report

See `FINAL_QA_REPORT.md` for the verification results and Render-safe deployment note.
