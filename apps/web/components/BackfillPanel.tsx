"use client";

import { useState } from "react";
import { runBackfill } from "../lib/phase4";

export function BackfillPanel() {
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setError(null);

    try {
      const end = new Date();
      const start = new Date(end.getTime() - 60 * 60 * 1000);
      const result = await runBackfill({
        exchange: "hyperliquid",
        symbol: "BTC-USD",
        interval: "1m",
        startTs: start.toISOString(),
        endTs: end.toISOString()
      });
      setJob(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backfill failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Historical Backfill</h3>
      <p className="small">Fetches the last 1 hour of BTC 1m candles into ClickHouse.</p>
      <button onClick={run} disabled={loading}>{loading ? "Running..." : "Backfill BTC 1m"}</button>
      {error && <p style={{ color: "#ff7684" }}>{error}</p>}
      {job && (
        <div style={{ marginTop: 12 }}>
          <div className="small">Job: {job.id}</div>
          <strong>{job.status}</strong>
          <div className="small">Candles inserted: {job.candlesInserted}</div>
          {job.error && <div style={{ color: "#ff7684" }}>{job.error}</div>}
        </div>
      )}
    </div>
  );
}
