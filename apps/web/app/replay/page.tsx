"use client";

import { BacktestPanel } from "../../components/BacktestPanel";
import { ChartPanel } from "../../components/ChartPanel";
import { ReplayControls } from "../../components/ReplayControls";
import { ReplayOverlayPanel } from "../../components/ReplayOverlayPanel";
import { WebGLHeatmapPanel } from "../../components/WebGLHeatmapPanel";
import { useReplayPlayback } from "../../hooks/useReplayPlayback";

export default function ReplayPage() {
  const replay = useReplayPlayback();

  return (
    <main>
      <div className="header">
        <div>
          <strong>Market Strategy Replay</strong>
          <div className="small">Phase 3/4 · replay, overlays, backtesting, and validation</div>
        </div>
      </div>

      <div style={{ padding: 12, display: "grid", gap: 12 }}>
        <ReplayControls
          playing={replay.playing}
          speed={replay.speed}
          loading={replay.loading}
          cursor={replay.cursor}
          onPlay={replay.play}
          onPause={replay.pause}
          onReset={replay.reset}
          onLoadMore={replay.loadMore}
          onSpeedChange={replay.setSpeed}
        />

        <div className="grid">
          <section className="panel">
            <ChartPanel />
          </section>

          <aside className="panel">
            <BacktestPanel />
          </aside>

          <section className="panel">
            <h3>WebGL Liquidity Heatmap</h3>
            <WebGLHeatmapPanel />
          </section>

          <aside className="panel">
            <h3>Replay Frames</h3>
            <div className="small">Loaded: {replay.frames.length}</div>
            <div style={{ display: "grid", gap: 6, marginTop: 10, maxHeight: 250, overflow: "auto" }}>
              {replay.frames.slice(-20).reverse().map((frame) => (
                <div key={frame.index} style={{ border: "1px solid #1b2940", borderRadius: 8, padding: 8 }}>
                  <strong>#{frame.index}</strong> · Close {frame.close}
                  <div className="small">{new Date(frame.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <ReplayOverlayPanel />
      </div>
    </main>
  );
}
