import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';

interface Props { values: number[]; height?: number; }

export function Bars({ values, height = 48 }: Props) {
  const theme = useTheme();

  const bars = useMemo(() => {
    const n = values.length;
    if (n === 0) return [];
    const max = Math.max(...values, 1);
    const gap = 3;
    const totalGap = gap * (n - 1);
    const w = (360 - totalGap) / n;
    return values.map((v, i) => ({
      x: i * (w + gap),
      w,
      h: Math.max(2, (v / max) * (height - 4)),
      isLast: i === n - 1,
    }));
  }, [values, height]);

  return (
    <View style={{ height }}>
      <Svg viewBox={`0 0 360 ${height}`} width="100%" height={height} preserveAspectRatio="none">
        {bars.map((b, i) => (
          <Rect
            key={i}
            x={b.x}
            y={height - b.h}
            width={b.w}
            height={b.h}
            fill={b.isLast ? theme.accentHot : theme.accent}
            opacity={b.isLast ? 1 : 0.55}
          />
        ))}
      </Svg>
    </View>
  );
}
