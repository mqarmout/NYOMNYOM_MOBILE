import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';

interface BoxProps {
  title?: string;
  glow?: boolean;
  padding?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Box({ title, glow, padding = 13, children, style, onPress }: BoxProps) {
  const theme = useTheme();
  const borderColor = glow ? theme.accent : theme.borderHi;
  const inner = (
    <View style={[
      styles.box,
      { backgroundColor: theme.surface, borderColor, padding },
      glow && { shadowColor: theme.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 3 },
      style,
    ]}>
      {title && (
        <View style={[styles.titleWrap, { backgroundColor: theme.bg }]}>
          <Text style={[styles.titleText, { color: glow ? theme.accent : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
            {'[ ' + title + ' ]'}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress}>{inner}</Pressable>;
  }
  return inner;
}

export function Comment({ children, style }: { children: React.ReactNode; style?: object }) {
  const theme = useTheme();
  return (
    <Text style={[{ color: theme.muted, fontSize: 9, letterSpacing: 1.4, fontFamily: FONTS.jetbrains }, style]}>
      {children}
    </Text>
  );
}

export function Hero({ children, size = 34, style }: { children: React.ReactNode; size?: number; style?: object }) {
  const theme = useTheme();
  return (
    <Text style={[{
      color: theme.accentHot,
      fontSize: size,
      fontFamily: FONTS.jetbrains,
      fontVariant: ['tabular-nums'],
      textShadowColor: theme.accent,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      lineHeight: size * 1.1,
    }, style]}>
      {children}
    </Text>
  );
}

export function Mono({ children, style, size = 12, color }: { children: React.ReactNode; style?: object; size?: number; color?: string }) {
  const theme = useTheme();
  return (
    <Text style={[{ fontFamily: FONTS.jetbrains, fontSize: size, color: color ?? theme.cream, fontVariant: ['tabular-nums'] }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, position: 'relative' },
  titleWrap: {
    position: 'absolute', top: -8, left: 11,
    paddingHorizontal: 7, zIndex: 1,
  },
  titleText: { fontSize: 9, letterSpacing: 1.1 },
});
