import React, { useMemo, useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Polyline, Circle } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props { values: number[]; height?: number; hot?: boolean; }

export function AreaSpark({ values, height = 80, hot = true }: Props) {
  const theme = useTheme();
  const uid = useId().replace(/:/g, '');
  const id = `as${uid}`;

  const { line, area, last } = useMemo(() => {
    if (values.length < 2) return { line: '', area: '', last: [0, height / 2] as [number, number] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = (max - min) || 1;
    const n = values.length;
    const pts = values.map((v, i) => [
      (i / (n - 1)) * 356 + 2,
      height - 8 - ((v - min) / span) * (height - 18),
    ] as [number, number]);
    const lineStr = pts.map(p => p.map(x => x.toFixed(1)).join(',')).join(' ');
    const last = pts[pts.length - 1] ?? [356, height / 2];
    const areaStr = `${lineStr} ${last[0].toFixed(1)},${height} 2,${height}`;
    return { line: lineStr, area: areaStr, last };
  }, [values, height]);

  return (
    <View style={{ height }}>
      <Svg viewBox={`0 0 360 ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0" stopColor={theme.accent} stopOpacity="0.32" />
            <Stop offset="1" stopColor={theme.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Polyline points={area} fill={`url(#${id})`} stroke="none" />
        <Polyline points={line} fill="none" stroke={theme.accent} strokeWidth="1.6" />
        {hot && <Circle cx={last[0]} cy={last[1]} r="3.5" fill={theme.accentHot} />}
      </Svg>
    </View>
  );
}
