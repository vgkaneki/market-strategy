# Market Strategy LCE SDK

Portable GitHub-ready Liquidity Confluence Engine SDK for crypto market-structure platforms.

This repository contains a clean expanded SDK layout from the verified portable package. It is designed so other platforms can integrate the engine without depending on the Market Strategy chart application.

## Safety model

```txt
Market-data only
No order execution
No private keys
No wallet connection
No exchange write actions
No guaranteed trading outcomes
```

## Packages

```txt
@market-strategy/lce-core             Core normalization, level detection, confluence zones
@market-strategy/lce-adapters         Exchange payload normalization helpers
@market-strategy/lce-engines          Engine registry and normalized output contract
@market-strategy/lce-market-decision  Final combined Market Decision Engine
@market-strategy/lce-replay           JSONL recorder/replay helper
@market-strategy/lce-validation       Replay/forward validation helpers
```

## Run

```bash
npm test
npm run audit:engines
npm run demo:decision
```

Windows:

```bat
RUN_TESTS.bat
```

## Architecture

```txt
Candles / Order Book / Trades
        ↓
Individual Engines
        ↓
Normalized Engine Outputs
        ↓
Market Decision Engine
        ↓
Strong Demand Zone / Strong Supply Zone / Watch Zone / No Clean Edge
```

## Status

The registry includes every required engine category and the Market Decision Engine combines those normalized outputs. The remaining proof item is longer live walk-forward validation once enough future candles are available.
