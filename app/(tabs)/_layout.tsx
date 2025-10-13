import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { UserContext } from "../../services/UserContext";

export default function TabLayout() {

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useContext(UserContext);
  const activeColor = isDark ? "#7c3aed" : "#4f46e5";
  const inactiveColor = isDark ? "#aaa" : "#888";

  const [showSettings, setShowSettings] = useState(false);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Oculta del tab bar
        }}
      />

      <Tabs.Screen
        name="prospects"
        options={{
          title: "Prospectos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="qrscanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => (
            <Ionicons name="qr-code-outline" size={24} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
