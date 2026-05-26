# Phase 6 — Locked LCE SDK Compatibility Layer

## Summary

This phase makes the Market Strategy platform compatible with the uploaded LCE SDK ZIP without modifying that ZIP.

## Locked artifact

```text
external/lce-sdk/market-strategy-lce-sdk-main.zip
```

SHA-256:

```text
d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf
```

The ZIP is copied byte-for-byte and should not be edited.

## What was added

- Runtime SDK installer script
- SDK integrity verifier
- Dynamic SDK loader
- Platform ↔ LCE data mapper
- LCE Market Decision service
- LCE API routes
- LCE frontend panel/page
- Compatibility docs
- Mapper tests

## Why this architecture is correct

The LCE SDK says the charting platform should not contain the core decision logic. The SDK should.

So the platform now treats the SDK as the source of truth for:

- LCE core zones
- Registered engine categories
- Market Decision Engine output
- Replay/forward validation helpers
- Market-data-only safety contract

The platform provides:

- Data ingestion
- ClickHouse candle access
- WebSocket/live data
- UI rendering
- Reports/replay/research dashboard
- Compatibility wrapper

## Setup

From project root:

```bash
node scripts/install-lce-sdk.mjs
node scripts/verify-lce-sdk.mjs
```

Then start the platform.

## New API routes

```text
GET  /v1/lce/status
GET  /v1/lce/engines
POST /v1/lce/decision
GET  /v1/lce/decision/live
POST /v1/lce/validate-forward
```

## UI

```text
/lce
```

## Safety

The SDK is market-data-only. The compatibility layer preserves:

```text
marketDataOnly: true
noOrderExecution: true
```
