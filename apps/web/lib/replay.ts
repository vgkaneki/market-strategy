import { API_BASE } from "./api";

export async function fetchReplayFrames(params: {
  exchange: string;
  symbol: string;
  interval: string;
  cursor: number;
  limit: number;
}) {
  const qs = new URLSearchParams({
    exchange: params.exchange,
    symbol: params.symbol,
    interval: params.interval,
    cursor: String(params.cursor),
    limit: String(params.limit)
  });

  const res = await fetch(`${API_BASE}/v1/replay/frames?${qs}`);
  if (!res.ok) throw new Error(`Replay request failed: ${res.status}`);
  return res.json();
}

export async function runBacktest(params: {
  exchange: string;
  symbol: string;
  interval: string;
  lookback: number;
}) {
  const qs = new URLSearchParams({
    exchange: params.exchange,
    symbol: params.symbol,
    interval: params.interval,
    lookback: String(params.lookback)
  });

  const res = await fetch(`${API_BASE}/v1/backtest/run?${qs}`);
  if (!res.ok) throw new Error(`Backtest request failed: ${res.status}`);
  return res.json();
}
