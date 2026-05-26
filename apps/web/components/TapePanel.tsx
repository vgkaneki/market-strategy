"use client";

import { useMemo } from "react";
import { useMarketSocket } from "../hooks/useMarketSocket";

export function TapePanel() {
  const { messages } = useMarketSocket("hyperliquid", "BTC-USD", ["trades"]);

  const trades = useMemo(() => {
    return messages
      .filter((m) => m.topic.includes(":trades:"))
      .flatMap((m) => Array.isArray(m.payload?.raw) ? m.payload.raw : [m.payload])
      .slice(-20)
      .reverse();
  }, [messages]);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Volume / Tape</h3>
      <table style={{ width: "100%", fontSize: 13 }}>
        <tbody>
          {trades.map((trade: any, index: number) => {
            const side = String(trade.side ?? trade.raw?.side ?? "").toUpperCase();
            const price = String(trade.price ?? trade.px ?? trade.raw?.px ?? "-");
            const size = String(trade.size ?? trade.sz ?? trade.raw?.sz ?? "-");

            return (
              <tr key={`${price}-${size}-${index}`}>
                <td style={{ color: side === "B" || side === "BUY" ? "#52d6a0" : "#ff7684" }}>
                  {side || "?"}
                </td>
                <td>{price}</td>
                <td style={{ textAlign: "right" }}>{size}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
