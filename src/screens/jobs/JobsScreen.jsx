import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TODO: implement tabs: Applications | Contacts
// TODO: pull in JobContext — adapt from nyomnyom_web/src/context/JobContext.jsx
// TODO: Applications — kanban-style pipeline as horizontal scroll sections
//       (applied → screening → interviewing → offer)
//       Each card: company, role, date applied, salary range
//       Tap card to expand detail + edit/delete actions
// TODO: Add Job — stack screen or bottom sheet with full form
// TODO: Contacts — flat list grouped by company
//       Tap to call/email directly via Linking (expo-linking)

export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Jobs — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: "#888" },
});
