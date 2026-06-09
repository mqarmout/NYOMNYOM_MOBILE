import React, { useMemo, useId } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { FONTS } from '../../../theme/type';

interface Props { values: number[]; height?: number; hot?: boolean; labels?: string[]; }

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0]![0].toFixed(1)},${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(i + 2, pts.length - 1)]!;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function AreaSpark({ values, height = 80, hot = true, labels }: Props) {
  const theme = useTheme();
  const uid = useId().replace(/:/g, '');
  const id = `as${uid}`;

  const { linePath, areaPath, last, pts } = useMemo(() => {
    if (values.length < 2) return { linePath: '', areaPath: '', last: [0, height / 2] as [number, number], pts: [] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = (max - min) || 1;
    const n = values.length;
    const computedPts = values.map((v, i) => [
      (i / (n - 1)) * 356 + 2,
      height - 8 - ((v - min) / span) * (height - 18),
    ] as [number, number]);
    const linePath = smoothPath(computedPts);
    const last = computedPts[computedPts.length - 1] ?? [356, height / 2];
    const areaPath = `${linePath} L ${last[0].toFixed(1)},${height} L 2,${height} Z`;
    return { linePath, areaPath, last, pts: computedPts };
  }, [values, height]);

  const showLabels = labels && labels.length > 0 && pts.length > 0;

  return (
    <View>
      <View style={{ height }}>
        <Svg viewBox={`0 0 360 ${height}`} width="100%" height={height} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={theme.accent} stopOpacity="0.28" />
              <Stop offset="1" stopColor={theme.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill={`url(#${id})`} stroke="none" />
          <Path d={linePath} fill="none" stroke={theme.accent} strokeWidth="1.6" strokeLinejoin="round" />
          {hot && <Circle cx={last[0]} cy={last[1]} r="3.5" fill={theme.accentHot} />}
        </Svg>
      </View>
      {showLabels && (
        <View style={styles.labelRow}>
          {labels!.map((l, i) => {
            const show = i === 0 || i === Math.floor((labels!.length - 1) / 2) || i === labels!.length - 1;
            return (
              <Text
                key={i}
                style={[styles.label, { color: show ? theme.muted : 'transparent', fontFamily: FONTS.jetbrains }]}
              >
                {l}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 9, letterSpacing: 0.4 },
});
