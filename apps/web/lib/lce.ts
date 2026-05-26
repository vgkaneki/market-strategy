import { API_BASE } from "./api";

export async function fetchLceStatus() {
  const res = await fetch(`${API_BASE}/v1/lce/status`);
  if (!res.ok) throw new Error(`LCE status failed: ${res.status}`);
  return res.json();
}

export async function fetchLceEngines() {
  const res = await fetch(`${API_BASE}/v1/lce/engines`);
  if (!res.ok) throw new Error(`LCE engines failed: ${res.status}`);
  return res.json();
}

export async function fetchLiveLceDecision() {
  const qs = new URLSearchParams({
    exchange: "hyperliquid",
    symbol: "BTC-USD",
    interval: "1m",
    lookback: "1000"
  });

  const res = await fetch(`${API_BASE}/v1/lce/decision/live?${qs}`);
  if (!res.ok) throw new Error(`LCE decision failed: ${res.status}`);
  return res.json();
}
