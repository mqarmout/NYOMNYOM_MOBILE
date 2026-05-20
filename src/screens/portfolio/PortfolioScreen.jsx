import React from "react";
import { View, Text, StyleSheet } from "react-native";

// TODO: implement tabs: Projects | Skills | Experience | About
// TODO: pull in PortfolioContext — adapt from nyomnyom_web/src/context/PortfolioContext.jsx
// TODO: Projects — card list; tap to expand detail with GitHub/Live links
//       Use Linking.openURL for external links
// TODO: Skills — grouped by category, chip-style display
// TODO: Experience — timeline list, start/end dates
// TODO: About — editable profile fields (display_name, headline, bio, etc.)
// NOTE: this is the EDIT view; the public-facing portfolio is web-only

export default function PortfolioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Portfolio — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholder: { color: "#888" },
});
