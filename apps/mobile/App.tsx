import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ReplayScreen } from "./src/screens/ReplayScreen";
import { ResearchScreen } from "./src/screens/ResearchScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#07101d" }, headerTintColor: "#e8edf5" }}>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Replay" component={ReplayScreen} />
        <Stack.Screen name="Research" component={ResearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
