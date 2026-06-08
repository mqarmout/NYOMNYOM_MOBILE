import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { PixelIcon } from '../components/crt/PixelIcon';
import { haptic } from '../native/haptics';
import { useStore, PAGER } from '../state/store';
import type { SectionId } from '../data/types';

type TabDef = {
  id: SectionId | 'more';
  icon: string;
  label: string;
};

const TABS: TabDef[] = [
  { id: 'home',     icon: 'home',     label: 'HOME'  },
  { id: 'spending', icon: 'coins',    label: 'SPEND' },
  { id: 'fitness',  icon: 'fitness',  label: 'FIT'   },
  { id: 'climbing', icon: 'climb',    label: 'CLIMB' },
  { id: 'more',     icon: 'menu',     label: 'MORE'  },
];

interface Props { onMorePress: () => void; }

export function TabBar({ onMorePress }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const section = useStore(s => s.section);
  const go = useStore(s => s.go);

  return (
    <View style={[styles.bar, { backgroundColor: theme.bg, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map(t => {
        const active = t.id !== 'more' && section === t.id;
        return (
          <Pressable
            key={t.id}
            style={styles.tab}
            onPress={() => {
              haptic.select();
              if (t.id === 'more') { onMorePress(); return; }
              go(t.id as SectionId);
            }}
            accessibilityLabel={t.label}
          >
            <PixelIcon kind={t.icon} size={18} color={active ? theme.accentHot : theme.muted} />
            <Text style={[
              styles.label,
              { color: active ? theme.accent : theme.muted, fontFamily: FONTS.jetbrains },
            ]}>
              {t.label}
            </Text>
            {active && <View style={[styles.dot, { backgroundColor: theme.accent }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', borderTopWidth: 1,
    paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 9, letterSpacing: 1.2 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
});
