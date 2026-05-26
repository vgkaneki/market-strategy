"use client";

import { useCallback, useRef, useState } from "react";
import { fetchReplayFrames } from "../lib/replay";

export interface ReplayFrame {
  index: number;
  ts: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export function useReplayPlayback() {
  const [frames, setFrames] = useState<ReplayFrame[]>([]);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchReplayFrames({
        exchange: "hyperliquid",
        symbol: "BTC-USD",
        interval: "1m",
        cursor,
        limit: 200
      });

      setFrames((current) => [...current, ...(result.frames ?? [])]);
      setCursor(Number(result.nextCursor ?? cursor));
      return result;
    } finally {
      setLoading(false);
    }
  }, [cursor]);

  const play = useCallback(() => setPlaying(true), []);
  const pause = useCallback(() => setPlaying(false), []);
  const reset = useCallback(() => {
    setFrames([]);
    setCursor(0);
    setPlaying(false);
  }, []);

  return {
    frames,
    cursor,
    playing,
    speed,
    loading,
    setSpeed,
    play,
    pause,
    reset,
    loadMore
  };
}
