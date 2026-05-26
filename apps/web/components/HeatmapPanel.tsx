"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMarketSocket } from "../hooks/useMarketSocket";

export function HeatmapPanel() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { messages } = useMarketSocket("hyperliquid", "BTC-USD", ["heatmap"]);
  const tile = useMemo(() => [...messages].reverse().find((m) => m.topic.startsWith("heatmap:"))?.payload ?? null, [messages]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, width, height);
    const buckets = Array.isArray(tile?.buckets) ? tile.buckets : [];
    const rows = buckets.length ? buckets.slice(0, 80) : Array.from({ length: 50 }, (_, i) => ({ price: i, intensity: Math.random() }));
    const rowHeight = height / rows.length;
    rows.forEach((bucket: any, index: number) => {
      const intensity = Math.max(0, Math.min(1, Number(bucket.intensity ?? 0)));
      const y = index * rowHeight;
      ctx.globalAlpha = 0.15 + intensity * 0.75;
      ctx.fillStyle = intensity > 0.75 ? "#ff7b31" : intensity > 0.45 ? "#ffd84a" : "#245bff";
      ctx.fillRect(0, y, width * (0.2 + intensity * 0.8), Math.max(1, rowHeight - 1));
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = "#dce8ff";
      ctx.font = "10px system-ui";
      if (index % 8 === 0 && bucket.price) ctx.fillText(String(bucket.price), width - 72, y + rowHeight - 2);
    });
    ctx.globalAlpha = 1;
  }, [tile]);

  return <canvas ref={ref} style={{ width: "100%", height: 240, display: "block" }} />;
}
