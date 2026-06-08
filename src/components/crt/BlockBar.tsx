import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { STATUS } from '../../theme/palettes';

interface Props { pct: number; over?: boolean; }

export function BlockBar({ pct, over }: Props) {
  const theme = useTheme();
  const fill = over ? STATUS.red : theme.accent;
  const w = Math.min(100, pct);
  return (
    <View style={[styles.track, { backgroundColor: theme.surface2 }]}>
      <View style={[styles.fill, { width: `${w}%` as `${number}%`, backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 5, width: '100%' },
  fill: { height: '100%' },
});
