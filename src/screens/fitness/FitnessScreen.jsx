import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TODO: implement tabs: Workouts | Body Metrics
// TODO: pull in FitnessContext — adapt from nyomnyom_web/src/context/FitnessContext.jsx
// TODO: Workouts — grouped list by date, expandable sets per workout
//       FAB to log a new workout session
//       Within a workout: add sets inline (exercise, sets, reps, weight, duration)
//       Swipe-to-delete on individual sets and workouts
// TODO: Body Metrics — weight history as a line chart + list of entries
//       FAB to log today's weight
//       Chart: use react-native-svg or Victory Native

export default function FitnessScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Fitness — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: "#888" },
});
