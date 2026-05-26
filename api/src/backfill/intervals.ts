export const HYPERLIQUID_INTERVALS = new Set([
  "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "8h", "12h", "1d", "3d", "1w", "1M"
]);

const DYDX_INTERVAL_MAP: Record<string, string> = {
  "1m": "1MIN",
  "5m": "5MINS",
  "15m": "15MINS",
  "30m": "30MINS",
  "1h": "1HOUR",
  "4h": "4HOURS",
  "1d": "1DAY"
};

export function toDydxResolution(interval: string): string {
  const mapped = DYDX_INTERVAL_MAP[interval];
  if (!mapped) throw new Error(`Unsupported dYdX interval: ${interval}`);
  return mapped;
}

export function assertHyperliquidInterval(interval: string) {
  if (!HYPERLIQUID_INTERVALS.has(interval)) {
    throw new Error(`Unsupported Hyperliquid interval: ${interval}`);
  }
}
