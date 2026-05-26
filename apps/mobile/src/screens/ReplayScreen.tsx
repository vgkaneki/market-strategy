import React, { useState } from "react";
import { ScrollView, Text, Button, StyleSheet } from "react-native";
import { Card } from "../components/Card";
import { apiGet } from "../api";

export function ReplayScreen() {
  const [frames, setFrames] = useState<any[]>([]);

  async function load() {
    const result = await apiGet<any>("/v1/replay/frames?exchange=hyperliquid&symbol=BTC-USD&interval=1m&cursor=0&limit=20");
    setFrames(result.frames ?? []);
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Card title="Replay">
        <Button title="Load Frames" onPress={load} />
        <Text style={styles.text}>Loaded frames: {frames.length}</Text>
      </Card>
      {frames.map((frame) => (
        <Card key={frame.index} title={`Frame #${frame.index}`}>
          <Text style={styles.text}>Close: {frame.close}</Text>
          <Text style={styles.muted}>{new Date(frame.ts).toLocaleString()}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#07101d" },
  content: { padding: 16 },
  text: { color: "#e8edf5" },
  muted: { color: "#8d9bb3", marginTop: 8 }
});
