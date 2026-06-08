import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { FONTS } from '../../../theme/type';

interface Props { pyramid: Record<string, number>; }

const GRADES = ['V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10'];

export function GradePyramid({ pyramid }: Props) {
  const theme = useTheme();

  const rows = useMemo(() => {
    const active = GRADES.filter(g => (pyramid[g] ?? 0) > 0).reverse();
    const max = Math.max(...active.map(g => pyramid[g] ?? 0), 1);
    return active.map(g => ({ grade: g, count: pyramid[g] ?? 0, pct: (pyramid[g] ?? 0) / max }));
  }, [pyramid]);

  if (rows.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {rows.map(r => (
        <View key={r.grade} style={styles.row}>
          <Text style={[styles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{r.grade}</Text>
          <View style={[styles.track, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Svg width={`${Math.max(4, r.pct * 100)}%`} height="14">
              <Rect x="0" y="0" width="100%" height="14" fill={theme.accent} opacity={0.75} />
            </Svg>
          </View>
          <Text style={[styles.count, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{r.count}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 10, width: 28, textAlign: 'right' },
  track: { flex: 1, height: 14, borderWidth: 1, overflow: 'hidden' },
  count: { fontSize: 10, width: 20 },
});
