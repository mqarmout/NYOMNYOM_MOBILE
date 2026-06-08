import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { PixelIcon } from '../components/crt/PixelIcon';
import { haptic } from '../native/haptics';

interface Props {
  onTerminalOpen: () => void;
  onFabPress?: () => void;
}

export function CommandStrip({ onTerminalOpen, onFabPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      style={[styles.strip, { backgroundColor: theme.surface, borderTopColor: theme.border, borderBottomColor: theme.border }]}
      onPress={() => { haptic.tap(); onTerminalOpen(); }}
      accessibilityLabel="Open terminal"
    >
      <Text style={[styles.prompt, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{'>'}</Text>
      <Text style={[styles.hint, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
        type a command... <Text style={{ color: theme.faint }}>/ to open terminal</Text>
      </Text>
      <View style={[styles.iconBtn, { borderColor: theme.borderHi }]}>
        <PixelIcon kind="terminal" size={14} color={theme.accentDim} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderTopWidth: 1, borderBottomWidth: 1,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  prompt: { fontSize: 14, lineHeight: 18 },
  hint: { flex: 1, fontSize: 11, letterSpacing: 0.4 },
  iconBtn: { width: 30, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
