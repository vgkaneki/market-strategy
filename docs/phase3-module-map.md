# Phase 3 Module Map

## Replay

| File | Purpose |
|---|---|
| `services/api/src/replay/ReplayPlaybackService.ts` | Cursor-based replay frame retrieval |
| `services/api/src/routes/replay.ts` | Replay sessions and replay frames |
| `apps/web/hooks/useReplayPlayback.ts` | Browser replay state/hook |
| `apps/web/components/ReplayControls.tsx` | Replay play/pause/speed controls |
| `apps/web/app/replay/page.tsx` | Replay workspace |

## Level engines

| File | Purpose |
|---|---|
| `services/api/src/levels/types.ts` | Common level engine interfaces |
| `services/api/src/levels/SwingPivotLevelEngine.ts` | Swing high/low support/resistance levels |
| `services/api/src/levels/LiquiditySweepLevelEngine.ts` | Sweep/reclaim reversal levels |
| `services/api/src/levels/LevelEngineRegistry.ts` | Plugin-style level engine registry |

## Backtesting

| File | Purpose |
|---|---|
| `services/api/src/backtest/types.ts` | Backtest input/output types |
| `services/api/src/backtest/ReversalBacktester.ts` | Touch/reaction simulation |
| `services/api/src/backtest/BacktestService.ts` | ClickHouse query + engines + backtester |
| `services/api/src/routes/backtest.ts` | Backtest API route |
| `apps/web/components/BacktestPanel.tsx` | Backtest UI panel |

## Heatmap

| File | Purpose |
|---|---|
| `apps/web/components/WebGLHeatmapPanel.tsx` | GPU/WebGL-style liquidity heatmap renderer |

## Tests

| File | Purpose |
|---|---|
| `services/api/tests/level-engine.test.ts` | Built-in level engines |
| `services/api/tests/backtester.test.ts` | Reaction/touch logic |
| `services/api/tests/replay-playback.test.ts` | Replay cursor logic |
