import React, { useState } from "react";
import { ScrollView, Text, Button, StyleSheet } from "react-native";
import { Card } from "../components/Card";
import { apiGet } from "../api";

export function ResearchScreen() {
  const [engines, setEngines] = useState<any[]>([]);

  async function loadEngines() {
    const result = await apiGet<any>("/v1/backtest/engines");
    setEngines(result.engines ?? []);
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Card title="Research">
        <Button title="Load Level Engines" onPress={loadEngines} />
        <Text style={styles.text}>Engines: {engines.length}</Text>
      </Card>
      {engines.map((engine) => (
        <Card key={engine.id} title={engine.label}>
          <Text style={styles.muted}>{engine.id}</Text>
          <Text style={styles.text}>Min candles: {engine.minCandles}</Text>
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
