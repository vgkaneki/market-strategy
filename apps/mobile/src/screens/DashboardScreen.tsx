import React, { useEffect, useState } from "react";
import { ScrollView, Text, Button, StyleSheet } from "react-native";
import { Card } from "../components/Card";
import { apiGet } from "../api";

export function DashboardScreen({ navigation }: any) {
  const [health, setHealth] = useState<string>("checking");

  useEffect(() => {
    apiGet<any>("/health").then(() => setHealth("online")).catch(() => setHealth("offline"));
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Card title="Market Strategy Mobile">
        <Text style={styles.text}>API status: {health}</Text>
        <Text style={styles.muted}>Mobile companion for dashboard, replay, alerts, scanner, and reports.</Text>
      </Card>
      <Button title="Open Replay" onPress={() => navigation.navigate("Replay")} />
      <Button title="Open Research" onPress={() => navigation.navigate("Research")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#07101d" },
  content: { padding: 16 },
  text: { color: "#e8edf5" },
  muted: { color: "#8d9bb3", marginTop: 8 }
});
