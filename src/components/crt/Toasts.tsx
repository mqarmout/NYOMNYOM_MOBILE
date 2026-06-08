import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { STATUS } from '../../theme/palettes';
import { FONTS } from '../../theme/type';
import { useStore } from '../../state/store';

export function Toasts() {
  const theme = useTheme();
  const toasts = useStore(s => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(t => {
        const c = t.kind === 'err' ? STATUS.red : t.kind === 'warn' ? STATUS.amber : theme.accent;
        return (
          <View key={t.id} style={[styles.toast, { backgroundColor: theme.surface, borderColor: c }]}>
            <Text style={[styles.tag, { color: c, fontFamily: FONTS.jetbrains }]}>
              {t.kind === 'err' ? '[!]' : t.kind === 'warn' ? '[!!]' : '[OK]'}
            </Text>
            <Text style={[styles.msg, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{t.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 14, right: 14, bottom: 96,
    zIndex: 90, gap: 8,
  },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 9,
    borderWidth: 1, padding: 11, paddingHorizontal: 13,
  },
  tag: { fontSize: 11, fontWeight: '700' },
  msg: { fontSize: 11, flex: 1 },
});
