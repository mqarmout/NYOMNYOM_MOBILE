import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Pattern, Rect, Stop, RadialGradient } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

function Scanlines() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Pattern id="sl" x="0" y="0" width={width} height="2" patternUnits="userSpaceOnUse">
            <Rect width={width} height="1" fill="transparent" />
            <Rect y="1" width={width} height="1" fill="rgba(0,0,0,0.16)" />
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill="url(#sl)" />
      </Svg>
    </View>
  );
}

function Vignette() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <RadialGradient id="vg" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="52%" stopColor="#000000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#vg)" />
      </Svg>
    </View>
  );
}

export function CRTScreen({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      {children}
      <Scanlines />
      <Vignette />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
});
