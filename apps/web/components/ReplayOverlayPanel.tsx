"use client";

import { useState } from "react";
import { fetchReplayOverlays } from "../lib/phase4";

export function ReplayOverlayPanel() {
  const [overlays, setOverlays] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const result = await fetchReplayOverlays();
      setOverlays(result.overlays ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Overlay fetch failed");
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Replay Overlays</h3>
      <button onClick={load}>Load Level Overlays</button>
      {error && <p style={{ color: "#ff7684" }}>{error}</p>}

      <div style={{ display: "grid", gap: 8, marginTop: 12, maxHeight: 300, overflow: "auto" }}>
        {overlays.length === 0 && <div className="small">No overlays loaded.</div>}
        {overlays.slice(-20).reverse().map((overlay) => (
          <div key={overlay.id} style={{ border: "1px solid #1b2940", borderRadius: 10, padding: 10 }}>
            <strong>{overlay.side} · {overlay.price}</strong>
            <div className="small">{overlay.engine} · Strength {overlay.strength}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
