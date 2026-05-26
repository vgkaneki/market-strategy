"use client";

import { useState } from "react";
import { runConfluence } from "../lib/phase4";

export function ConfluencePanel() {
  const [zones, setZones] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    try {
      const result = await runConfluence();
      setZones(result.zones ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confluence failed");
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Multi-Timeframe Confluence</h3>
      <button onClick={run}>Run Confluence</button>
      {error && <p style={{ color: "#ff7684" }}>{error}</p>}

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {zones.length === 0 && <div className="small">No zones loaded.</div>}
        {zones.slice(0, 12).map((zone) => (
          <div key={zone.id} style={{ border: "1px solid #1b2940", borderRadius: 10, padding: 10 }}>
            <strong>{zone.side} · Score {zone.score}</strong>
            <div className="small">{zone.lowPrice} → {zone.highPrice}</div>
            <div className="small">TFs: {(zone.timeframes ?? []).join(", ")}</div>
            <div className="small">Engines: {(zone.engines ?? []).join(", ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
