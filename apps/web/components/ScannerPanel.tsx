"use client";

import { useMemo } from "react";
import { useMarketSocket } from "../hooks/useMarketSocket";

export function ScannerPanel() {
  const { connected, messages } = useMarketSocket("hyperliquid", "BTC-USD", ["scanner"]);
  const signals = useMemo(() => messages.filter((m) => m.topic.startsWith("scanner:")).map((m) => m.payload).slice(-12).reverse(), [messages]);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Scanner</h3>
      <div className="small">{connected ? "Listening for liquidity wall signals" : "Scanner socket disconnected"}</div>
      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {signals.length === 0 && <div className="small">No scanner signals yet. Large book walls will appear here.</div>}
        {signals.map((signal: any, index: number) => (
          <div key={`${signal.ts}-${signal.price}-${index}`} style={{ border: "1px solid #1b2940", borderRadius: 12, padding: 10, background: "#0a101b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong style={{ color: signal.side === "bid" ? "#52d6a0" : "#ff7684" }}>{String(signal.side ?? "").toUpperCase()} Wall</strong>
              <span>Score {signal.score}</span>
            </div>
            <div className="small">Price: {signal.price}</div>
            <div className="small">Notional: ${Number(signal.notional ?? 0).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
