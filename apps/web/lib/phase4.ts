import { API_BASE } from "./api";

export async function runBackfill(input: {
  exchange: string;
  symbol: string;
  interval: string;
  startTs: string;
  endTs: string;
}) {
  const res = await fetch(`${API_BASE}/v1/backfill/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error(`Backfill failed: ${res.status}`);
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API_BASE}/v1/reports`);
  if (!res.ok) throw new Error(`Reports failed: ${res.status}`);
  return res.json();
}

export async function runConfluence() {
  const qs = new URLSearchParams({
    exchange: "hyperliquid",
    symbol: "BTC-USD",
    timeframes: "1m,5m,15m,1h",
    lookback: "1000"
  });
  const res = await fetch(`${API_BASE}/v1/confluence/run?${qs}`);
  if (!res.ok) throw new Error(`Confluence failed: ${res.status}`);
  return res.json();
}

export async function fetchReplayOverlays() {
  const qs = new URLSearchParams({
    exchange: "hyperliquid",
    symbol: "BTC-USD",
    interval: "1m",
    lookback: "1000"
  });
  const res = await fetch(`${API_BASE}/v1/replay/overlays?${qs}`);
  if (!res.ok) throw new Error(`Overlays failed: ${res.status}`);
  return res.json();
}
