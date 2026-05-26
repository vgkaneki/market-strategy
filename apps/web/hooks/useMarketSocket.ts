"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createMarketSocket } from "../lib/api";

export interface MarketSocketMessage {
  topic: string;
  payload: any;
}

export function useMarketSocket(exchange: "hyperliquid" | "dydx", symbol: string, channels: string[]) {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<MarketSocketMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  const channelKey = useMemo(() => channels.join(","), [channels]);

  useEffect(() => {
    const ws = createMarketSocket();
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      for (const channel of channels) {
        ws.send(JSON.stringify({ type: "subscribe", exchange, channel, symbol }));
      }
    };

    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (!parsed.topic || !parsed.payload) return;

        setMessages((current) => {
          const next = [...current, parsed].slice(-500);
          return next;
        });
      } catch {
        // Ignore malformed status/control messages in UI hook.
      }
    };

    return () => {
      for (const channel of channels) {
        try {
          ws.send(JSON.stringify({ type: "unsubscribe", exchange, channel, symbol }));
        } catch {}
      }
      ws.close();
    };
  }, [exchange, symbol, channelKey]);

  return { connected, messages };
}
