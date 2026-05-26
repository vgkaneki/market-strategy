# Phase 3 Runbook

## Goal

Validate that the platform can replay historical data and backtest chart-displayable levels.

## Backend checks

### Health

```bash
curl http://localhost:8787/health
```

### Backtest endpoint

```bash
curl "http://localhost:8787/v1/backtest/run?exchange=hyperliquid&symbol=BTC-USD&interval=1m&lookback=500"
```

Expected response shape:

```json
{
  "summary": {
    "levelsTested": 0,
    "touches": 0,
    "wins": 0,
    "reactionRate": 0
  },
  "levels": [],
  "trades": []
}
```

If candles are present in ClickHouse, results should contain generated levels and touch/reaction stats.

### Replay frames

```bash
curl "http://localhost:8787/v1/replay/frames?exchange=hyperliquid&symbol=BTC-USD&interval=1m&cursor=0&limit=100"
```

Expected:

```json
{
  "cursor": 0,
  "nextCursor": 100,
  "frames": []
}
```

## Frontend checks

Open:

```text
http://localhost:3000/replay
```

Expected:

- Replay controls render.
- Backtest panel renders.
- Backtest button calls API.
- Report summary displays.

## Known limitations

Phase 3 assumes candles already exist in ClickHouse.

If you do not have candles yet, the next required module is a historical candle backfill worker.

## Bugs to watch for

- Backtest accidentally using future levels.
- Too many candles causing slow queries.
- Repeated scanner/backtest signals from duplicate candles.
- Candle interval mismatch such as `1m` vs `1MIN`.
- WebGL context failing on older mobile devices.
- ClickHouse Decimal values returning as strings.
