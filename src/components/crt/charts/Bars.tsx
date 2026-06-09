import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeProvider';
import { FONTS } from '../../../theme/type';

interface Props { values: number[]; height?: number; labels?: string[]; showAllLabels?: boolean; }

export function Bars({ values, height = 48, labels, showAllLabels = false }: Props) {
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

  const hasLabels = labels && labels.length > 0;
  const LABEL_SPACE = showAllLabels && hasLabels ? 58 : 0;
  const svgH = height + LABEL_SPACE;

  return (
    <View>
      <View style={{ height: svgH }}>
        <Svg viewBox={`0 0 360 ${svgH}`} width="100%" height={svgH} preserveAspectRatio="none">
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
          {hasLabels && showAllLabels && labels!.map((l, i) => {
            const bar = bars[i];
            if (!bar) return null;
            const cx = bar.x + bar.w / 2;
            const ly = height + 14;
            return (
              <SvgText
                key={`lbl-${i}`}
                x={cx}
                y={ly}
                fontSize="9"
                fill={theme.muted}
                fontFamily={FONTS.jetbrains}
                transform={`rotate(40, ${cx}, ${ly})`}
                textAnchor="start"
              >
                {l}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      {hasLabels && !showAllLabels && (
        <View style={styles.labelRow}>
          {labels!.map((l, i) => {
            const n = labels!.length;
            const show = i === 0 || i === Math.floor((n - 1) / 2) || i === n - 1;
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
