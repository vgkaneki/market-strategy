import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0b1422",
    borderColor: "#1b2940",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  title: {
    color: "#e8edf5",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  }
});
