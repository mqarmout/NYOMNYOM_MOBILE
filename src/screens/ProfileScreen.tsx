import React from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { PixelIcon } from '../components/crt/PixelIcon';
import { haptic } from '../native/haptics';
import type { PaletteName } from '../theme/palettes';
import type { FontName } from '../theme/type';

const PALETTES: { name: PaletteName; label: string }[] = [
  { name: 'green', label: 'P1 · GREEN PHOSPHOR' },
  { name: 'amber', label: 'P3 · AMBER PHOSPHOR' },
  { name: 'cyan',  label: 'P2 · CYAN PHOSPHOR'  },
];

const FONTS_LIST: { name: FontName; label: string }[] = [
  { name: 'jetbrains', label: 'JetBrains Mono' },
  { name: 'plex',      label: 'IBM Plex Mono'  },
  { name: 'fira',      label: 'Fira Code'      },
];

interface Props { open: boolean; onClose: () => void; }

export function ProfileScreen({ open, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const auth = useStore(s => s.auth);
  const user = useStore(s => s.data.user);
  const palette = useStore(s => s.palette);
  const font = useStore(s => s.font);
  const setPalette = useStore(s => s.setPalette);
  const setFont = useStore(s => s.setFont);
  const logout = useStore(s => s.logout);
  const reset = useStore(s => s.reset);

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.bg }]}>
        <View style={[styles.header, { borderBottomColor: theme.border, paddingTop: insets.top + 12 }]}>
          <Text style={[styles.title, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{'// PROFILE'}</Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { borderColor: theme.borderHi, backgroundColor: theme.surface }]}>
            <PixelIcon kind="x" size={14} color={theme.accentDim} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Box title="IDENTITY">
            <Text style={[styles.userName, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{auth?.name ?? user.name}</Text>
            <Mono style={{ color: theme.muted }}>@{user.handle}</Mono>
            <Text style={[styles.userRole, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{user.role}</Text>
            <Mono style={{ color: theme.muted }}>{user.loc}</Mono>
          </Box>

          <Box title="PALETTE">
            <View style={styles.optionList}>
              {PALETTES.map(p => {
                const on = palette === p.name;
                return (
                  <Pressable
                    key={p.name}
                    onPress={() => { haptic.select(); setPalette(p.name); }}
                    style={[styles.option, {
                      backgroundColor: on ? theme.accent : theme.surface,
                      borderColor: on ? theme.accent : theme.border,
                    }]}
                  >
                    <Text style={[styles.optionText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                      {p.label}
                    </Text>
                    {on && <Text style={[styles.checkmark, { color: theme.bg, fontFamily: FONTS.jetbrains }]}>{'[ON]'}</Text>}
                  </Pressable>
                );
              })}
            </View>
          </Box>

          <Box title="FONT">
            <View style={styles.optionList}>
              {FONTS_LIST.map(f => {
                const on = font === f.name;
                return (
                  <Pressable
                    key={f.name}
                    onPress={() => { haptic.select(); setFont(f.name); }}
                    style={[styles.option, {
                      backgroundColor: on ? theme.accent : theme.surface,
                      borderColor: on ? theme.accent : theme.border,
                    }]}
                  >
                    <Text style={[styles.optionText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                      {f.label}
                    </Text>
                    {on && <Text style={[styles.checkmark, { color: theme.bg, fontFamily: FONTS.jetbrains }]}>{'[ON]'}</Text>}
                  </Pressable>
                );
              })}
            </View>
          </Box>

          <Box title="SYSTEM">
            <Pressable
              onPress={() => { haptic.warn(); reset(); }}
              style={[styles.sysBtn, { borderColor: theme.borderHi }]}
            >
              <Text style={[styles.sysBtnText, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>RESET SEED DATA</Text>
            </Pressable>
            <Pressable
              onPress={() => { haptic.error(); logout(); onClose(); }}
              style={[styles.sysBtn, { borderColor: '#ff6a5a' }]}
            >
              <Text style={[styles.sysBtnText, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>SIGN OUT</Text>
            </Pressable>
          </Box>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 10, letterSpacing: 1.4 },
  closeBtn: { width: 34, height: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 14, paddingBottom: 40, gap: 12 },
  userName: { fontSize: 22 },
  userRole: { fontSize: 14, marginTop: 4 },
  optionList: { gap: 6 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, padding: 13 },
  optionText: { fontSize: 13 },
  checkmark: { fontSize: 10, letterSpacing: 0.8 },
  sysBtn: { borderWidth: 1, padding: 13, marginBottom: 8, alignItems: 'center' },
  sysBtnText: { fontSize: 12, letterSpacing: 1.2 },
});
