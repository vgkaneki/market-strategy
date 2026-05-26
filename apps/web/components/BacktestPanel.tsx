"use client";

import { useState } from "react";
import { runBacktest } from "../lib/replay";

export function BacktestPanel() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);

    try {
      const result = await runBacktest({
        exchange: "hyperliquid",
        symbol: "BTC-USD",
        interval: "1m",
        lookback: 1000
      });
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed");
    } finally {
      setLoading(false);
    }
  }

  const summary = report?.summary;

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Level Backtest</h3>
      <button onClick={run} disabled={loading}>{loading ? "Running..." : "Run BTC 1m Backtest"}</button>

      {error && <p style={{ color: "#ff7684" }}>{error}</p>}

      {summary && (
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          <Metric label="Candles" value={summary.candles} />
          <Metric label="Levels" value={summary.levelsGenerated} />
          <Metric label="Touches" value={summary.touches} />
          <Metric label="Wins" value={summary.wins} />
          <Metric label="Losses" value={summary.losses} />
          <Metric label="Reaction Rate" value={`${summary.reactionRate}%`} />
          <Metric label="Avg MFE" value={`${summary.avgMfeBps} bps`} />
          <Metric label="Avg MAE" value={`${summary.avgMaeBps} bps`} />
        </div>
      )}

      {report?.levels?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="small">Recent levels</div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {report.levels.slice(-8).reverse().map((level: any) => (
              <div key={level.id} style={{ border: "1px solid #1b2940", borderRadius: 10, padding: 8 }}>
                <strong>{level.engine}</strong> · {level.side} · {level.price}
                <div className="small">Strength {level.strength} · Confidence {Math.round(level.confidence * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ background: "#0a101b", border: "1px solid #1b2940", borderRadius: 10, padding: 10 }}>
      <div className="small">{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
