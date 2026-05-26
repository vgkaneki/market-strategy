"use client";

import { useMemo } from "react";
import { useMarketSocket } from "../hooks/useMarketSocket";
import { LiveStatus } from "./LiveStatus";

type Level = [string, string];

function levelsFromPayload(payload: any): { bids: Level[]; asks: Level[] } {
  if (!payload) return { bids: [], asks: [] };

  const rawBids = payload.bids ?? payload.raw?.levels?.[0] ?? payload.raw?.bids ?? [];
  const rawAsks = payload.asks ?? payload.raw?.levels?.[1] ?? payload.raw?.asks ?? [];

  const normalize = (levels: any[]): Level[] =>
    Array.isArray(levels)
      ? levels.slice(0, 12).map((level) => {
          if (Array.isArray(level)) return [String(level[0]), String(level[1])] as Level;
          return [String(level.px ?? level.price ?? "0"), String(level.sz ?? level.size ?? "0")] as Level;
        })
      : [];

  return { bids: normalize(rawBids), asks: normalize(rawAsks) };
}

export function OrderBookPanel() {
  const { connected, messages } = useMarketSocket("hyperliquid", "BTC-USD", ["book"]);

  const latest = useMemo(() => {
    const lastBook = [...messages].reverse().find((m) => m.topic.includes(":book:"));
    return levelsFromPayload(lastBook?.payload);
  }, [messages]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Order Book</h3>
          <div className="small">BTC-USD · Hyperliquid</div>
        </div>
        <LiveStatus connected={connected} />
      </div>

      <table style={{ width: "100%", marginTop: 12, fontSize: 13 }}>
        <tbody>
          {latest.asks.slice().reverse().map(([price, size]) => (
            <tr key={`ask-${price}`}>
              <td style={{ color: "#ff7684" }}>{price}</td>
              <td style={{ textAlign: "right" }}>{size}</td>
            </tr>
          ))}

          <tr>
            <td colSpan={2} style={{ padding: "8px 0", color: "#8d9bb3" }}>spread / mid</td>
          </tr>

          {latest.bids.map(([price, size]) => (
            <tr key={`bid-${price}`}>
              <td style={{ color: "#52d6a0" }}>{price}</td>
              <td style={{ textAlign: "right" }}>{size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
