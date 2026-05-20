import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TODO: implement tabs: Dashboard | Expenses | Categories
// TODO: pull in AppContext (spending) — context not yet created for mobile,
//       copy pattern from nyomnyom_web/src/context/AppContext.jsx and adapt
//       (replace apiFetch import, same API endpoints)
// TODO: Dashboard — show monthly total, by-category breakdown, daily chart
//       Charts.jsx from the web uses SVG; on mobile use react-native-svg or
//       Victory Native instead
// TODO: Expenses — list with swipe-to-delete, FAB to add new
// TODO: Add Expense — bottom sheet or stack screen with form
// TODO: Categories — list with budget bars, add/edit/delete

export default function SpendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Spending — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: "#888" },
});
