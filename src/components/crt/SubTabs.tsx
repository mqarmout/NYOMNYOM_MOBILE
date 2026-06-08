import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { haptic } from '../../native/haptics';

interface Props {
  tabs: string[];
  active: number;
  onSelect: (i: number) => void;
}

export function SubTabs({ tabs, active, onSelect }: Props) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.row}
      scrollEventThrottle={16}
    >
      {tabs.map((label, i) => {
        const on = active === i;
        return (
          <Pressable
            key={label}
            onPress={() => { haptic.select(); onSelect(i); }}
            style={[
              styles.tab,
              {
                backgroundColor: on ? theme.accent : 'transparent',
                borderColor: on ? theme.accent : theme.border,
              },
            ]}
          >
            <Text style={[
              styles.label,
              { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains, fontWeight: on ? '700' : '500' },
            ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: { flexGrow: 0, flexShrink: 0 },
  row: { flexDirection: 'row', gap: 6, paddingVertical: 8, paddingHorizontal: 14 },
  tab: { borderWidth: 1, paddingVertical: 7, paddingHorizontal: 14, height: 34, justifyContent: 'center' },
  label: { fontSize: 11, letterSpacing: 0.7 },
});
