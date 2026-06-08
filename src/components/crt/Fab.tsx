import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { PixelIcon } from './PixelIcon';
import { haptic } from '../../native/haptics';

export function Fab({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => { haptic.tap(); onPress(); }}
      style={[styles.fab, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
      accessibilityLabel="Add"
    >
      <PixelIcon kind="plus" size={22} color={theme.bg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 150, right: 18,
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12,
    elevation: 8, zIndex: 75,
  },
});
