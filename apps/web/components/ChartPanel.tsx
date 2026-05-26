"use client";

import { useEffect, useMemo, useRef } from "react";
import { createChart, ColorType, ISeriesApi, CandlestickData } from "lightweight-charts";
import { useMarketSocket } from "../hooks/useMarketSocket";

export function ChartPanel() {
  const ref = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { messages } = useMarketSocket("hyperliquid", "BTC-USD", ["candles"]);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0d1320" },
        textColor: "#8d9bb3"
      },
      grid: {
        vertLines: { color: "#142033" },
        horzLines: { color: "#142033" }
      },
      height: 420,
      rightPriceScale: {
        borderColor: "#1b2940"
      },
      timeScale: {
        borderColor: "#1b2940"
      }
    });

    const series = chart.addCandlestickSeries();
    seriesRef.current = series;

    series.setData([
      { time: 1760000000 as any, open: 65000, high: 67000, low: 64000, close: 66500 },
      { time: 1760000060 as any, open: 66500, high: 69000, low: 66000, close: 68400 },
      { time: 1760000120 as any, open: 68400, high: 68600, low: 65000, close: 65700 }
    ]);

    chart.timeScale().fitContent();

    const resize = () => {
      if (!ref.current) return;
      chart.applyOptions({ width: ref.current.clientWidth });
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      seriesRef.current = null;
      chart.remove();
    };
  }, []);

  const latestCandle = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.topic.includes(":candles:"))?.payload;
    if (!last) return null;

    const raw = last.raw ?? last;
    const ts = Number(last.ts ?? raw.t ?? Date.now());
    const candle: CandlestickData = {
      time: Math.floor(ts / 1000) as any,
      open: Number(last.open ?? raw.o ?? 0),
      high: Number(last.high ?? raw.h ?? 0),
      low: Number(last.low ?? raw.l ?? 0),
      close: Number(last.close ?? raw.c ?? 0)
    };
    return candle;
  }, [messages]);

  useEffect(() => {
    if (!latestCandle || !seriesRef.current) return;
    if (!Number.isFinite(latestCandle.open) || latestCandle.open <= 0) return;
    seriesRef.current.update(latestCandle);
  }, [latestCandle]);

  return <div ref={ref} style={{ width: "100%", height: 420 }} />;
}
