import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TODO: pull in ClimbingContext — adapt from nyomnyom_web/src/context/ClimbingContext.jsx
// TODO: list of climbs, newest first; filter chips at top (boulder/sport, sent/flash)
// TODO: each card: grade, name, location, wall type, sent/flash badges, attempts
//       tap to expand notes + photo
// TODO: FAB to log a new climb
// TODO: Add Climb form — all fields from the web version
// TODO: photo upload — use expo-image-picker to select from camera roll
//       then POST FormData to /api/climbing/<id>/photo
//       (same two-step flow as the web: POST JSON first, then POST photo)
// TODO: display climb photos inline using <Image> with the server URL

export default function ClimbingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Climbing — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: "#888" },
});
