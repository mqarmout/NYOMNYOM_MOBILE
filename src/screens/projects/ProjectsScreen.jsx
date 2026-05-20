import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TODO: implement tabs: Projects | Kanban
// TODO: pull in ProjectsContext — adapt from nyomnyom_web/src/context/ProjectsContext.jsx
//
// Projects tab:
// TODO: list of dev projects sorted by priority; tap to expand detail
//       show GitHub last-commit badge (fetch /api/dev-projects/<id>/commit)
//       todos as a checklist within the expanded card
//       GitHub/Live URL → Linking.openURL
//
// Kanban tab:
// TODO: horizontal scroll of three columns: Backlog | In Progress | Done
//       each task card: title, priority badge, due date, linked project
//       drag-to-move between columns — look into react-native-draggable-flatlist
//       or a simpler tap-to-move-status approach for v1

export default function ProjectsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Projects — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: "#888" },
});
