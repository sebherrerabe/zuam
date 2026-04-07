import { StyleSheet, Text, View } from "react-native";

import { buildDemoTask } from "../src/features/tasks/demo-task";

export default function HomeScreen() {
  const task = buildDemoTask();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Zuam Mobile</Text>
      <Text style={styles.subtitle}>First task scaffold: {task.title}</Text>
      <Text style={styles.meta}>Status: {task.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f7f8fc"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#13203b"
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#24365f"
  },
  meta: {
    marginTop: 8,
    fontSize: 14,
    color: "#5b6af0"
  }
});
