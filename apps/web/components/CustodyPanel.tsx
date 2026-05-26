"use client";

import { useState } from "react";
import { API_BASE } from "../lib/api";

export function CustodyPanel() {
  const [policy, setPolicy] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPolicy() {
    setError(null);
    const token = localStorage.getItem("marketStrategyAccessToken") ?? "";
    try {
      const res = await fetch(`${API_BASE}/v1/custody/policy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Custody policy failed: ${res.status}`);
      setPolicy(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Custody request failed");
    }
  }

  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Custody Controls</h3>
      <p className="small">Default mode is disabled/dry-run. No private keys are stored by this app.</p>
      <button onClick={loadPolicy}>Load Custody Policy</button>
      {error && <p style={{ color: "#ff7684" }}>{error}</p>}
      {policy && <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{JSON.stringify(policy, null, 2)}</pre>}
    </div>
  );
}
