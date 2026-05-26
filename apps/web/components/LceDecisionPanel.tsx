"use client";

import { useState } from "react";
import { fetchLceEngines, fetchLceStatus, fetchLiveLceDecision } from "../lib/lce";

export function LceDecisionPanel() {
  const [status, setStatus] = useState<any>(null);
  const [engines, setEngines] = useState<any>(null);
  const [decision, setDecision] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<any>, setter: (value: any) => void) {
    setError(null);
    try {
      setter(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : "LCE request failed");
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Locked LCE SDK Compatibility</h3>
      <p className="small">
        Uses the uploaded LCE SDK as the source of truth for confluence zones and Market Decision Engine output.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={() => run(fetchLceStatus, setStatus)}>Check SDK Status</button>
        <button onClick={() => run(fetchLceEngines, setEngines)}>Load Engines</button>
        <button onClick={() => run(fetchLiveLceDecision, setDecision)}>Run Live Decision</button>
      </div>

      {error && <p style={{ color: "#ff7684" }}>{error}</p>}

      {status && (
        <div style={{ marginTop: 12 }}>
          <strong>Status</strong>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}

      {engines && (
        <div style={{ marginTop: 12 }}>
          <strong>Registered Engines</strong>
          <div className="small">Required: {engines.requiredEngineIds?.length ?? 0}</div>
          <div className="small">Registered: {engines.registeredEngineIds?.length ?? 0}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {(engines.registeredEngineIds ?? []).map((id: string) => (
              <span key={id} style={{ border: "1px solid #1b2940", borderRadius: 999, padding: "4px 8px", fontSize: 12 }}>
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {decision && (
        <div style={{ marginTop: 12 }}>
          <strong>Market Decision</strong>
          <div style={{ marginTop: 8, padding: 12, border: "1px solid #1b2940", borderRadius: 12 }}>
            <h2 style={{ margin: 0 }}>{decision.decision}</h2>
            <div className="small">Confidence: {decision.confidence}</div>
            <div className="small">Side: {decision.side}</div>
            <div className="small">Zone: {decision.zoneLow ?? "-"} → {decision.zoneHigh ?? "-"}</div>
            <div className="small">Market data only: {String(decision.marketDataOnly)}</div>
            <div className="small">No order execution: {String(decision.noOrderExecution)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
