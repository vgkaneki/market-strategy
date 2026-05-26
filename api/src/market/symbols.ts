export type SupportedExchange = "hyperliquid" | "dydx";

export const CANONICAL_SYMBOLS = ["BTC-USD", "ETH-USD", "SOL-USD"] as const;
export type CanonicalSymbol = typeof CANONICAL_SYMBOLS[number];

const toVenue: Record<SupportedExchange, Record<CanonicalSymbol, string>> = {
  hyperliquid: {
    "BTC-USD": "BTC",
    "ETH-USD": "ETH",
    "SOL-USD": "SOL"
  },
  dydx: {
    "BTC-USD": "BTC-USD",
    "ETH-USD": "ETH-USD",
    "SOL-USD": "SOL-USD"
  }
};

const fromVenue: Record<SupportedExchange, Record<string, CanonicalSymbol>> = {
  hyperliquid: {
    BTC: "BTC-USD",
    ETH: "ETH-USD",
    SOL: "SOL-USD"
  },
  dydx: {
    "BTC-USD": "BTC-USD",
    "ETH-USD": "ETH-USD",
    "SOL-USD": "SOL-USD"
  }
};

export function toVenueSymbol(exchange: SupportedExchange, symbol: string): string {
  const normalized = symbol.toUpperCase();
  if (exchange === "hyperliquid" && ["BTC", "ETH", "SOL"].includes(normalized)) return normalized;
  return toVenue[exchange][normalized as CanonicalSymbol] ?? normalized;
}

export function toCanonicalSymbol(exchange: SupportedExchange, venueSymbol: string): string {
  return fromVenue[exchange][venueSymbol.toUpperCase()] ?? venueSymbol.toUpperCase();
}

export function isSupportedExchange(exchange: string): exchange is SupportedExchange {
  return exchange === "hyperliquid" || exchange === "dydx";
}
