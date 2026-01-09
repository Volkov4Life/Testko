import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface BackButtonProps {
  text?: string;
  color?: string;
  style?: object;
}

export default function BackButton({ text = "   ", color = "#0070BB", style = {} }: BackButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => router.back()}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={28} color={color} />
      {text && <Text style={[styles.text, { color }]}>{text}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "#0070BB",
    borderRadius: 8,
    
    alignSelf: "flex-start",   // <-- shrink to content width
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 6,
  },
});
