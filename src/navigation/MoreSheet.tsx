import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { PixelIcon } from '../components/crt/PixelIcon';
import { haptic } from '../native/haptics';
import { useStore } from '../state/store';
import type { SectionId } from '../data/types';
import type { PaletteName } from '../theme/palettes';

interface MoreItem {
  id: SectionId;
  icon: string;
  label: string;
}

const MORE_ITEMS: MoreItem[] = [
  { id: 'hydro',     icon: 'drop',      label: 'HYDROPONICS'   },
  { id: 'jobs',      icon: 'briefcase', label: 'JOB TRACKER'   },
  { id: 'portfolio', icon: 'user',      label: 'PORTFOLIO'     },
  { id: 'projects',  icon: 'code',      label: 'DEV PROJECTS'  },
];

const PALETTES: { name: PaletteName; label: string }[] = [
  { name: 'green', label: 'P1·GREEN' },
  { name: 'amber', label: 'P3·AMBER' },
  { name: 'cyan',  label: 'P2·CYAN'  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onProfile: () => void;
}

export function MoreSheet({ open, onClose, onProfile }: Props) {
  const theme = useTheme();
  const go = useStore(s => s.go);
  const logout = useStore(s => s.logout);
  const setPalette = useStore(s => s.setPalette);
  const palette = useStore(s => s.palette);

  function nav(id: SectionId) {
    haptic.select();
    go(id);
    onClose();
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// MORE</Text>
          <Pressable onPress={onClose} style={[styles.closeBtn, { borderColor: theme.borderHi, backgroundColor: theme.surface }]}>
            <PixelIcon kind="x" size={14} color={theme.accentDim} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {MORE_ITEMS.map(item => (
            <Pressable
              key={item.id}
              style={[styles.row, { borderColor: theme.border }]}
              onPress={() => nav(item.id)}
            >
              <PixelIcon kind={item.icon} size={16} color={theme.accentDim} />
              <Text style={[styles.rowLabel, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{item.label}</Text>
              <PixelIcon kind="arrow" size={12} color={theme.muted} />
            </Pressable>
          ))}

          <View style={[styles.section, { borderColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// PALETTE</Text>
            <View style={styles.chips}>
              {PALETTES.map(p => {
                const on = palette === p.name;
                return (
                  <Pressable
                    key={p.name}
                    onPress={() => { haptic.select(); setPalette(p.name); }}
                    style={[styles.chip, {
                      backgroundColor: on ? theme.accent : theme.surface,
                      borderColor: on ? theme.accent : theme.border,
                    }]}
                  >
                    <Text style={[styles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            style={[styles.row, { borderColor: theme.border }]}
            onPress={() => { haptic.select(); onProfile(); onClose(); }}
          >
            <PixelIcon kind="user" size={16} color={theme.accentDim} />
            <Text style={[styles.rowLabel, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>PROFILE</Text>
            <PixelIcon kind="arrow" size={12} color={theme.muted} />
          </Pressable>

          <Pressable
            style={[styles.row, { borderColor: theme.border }]}
            onPress={() => { haptic.warn(); logout(); onClose(); }}
          >
            <PixelIcon kind="power" size={16} color="#ff6a5a" />
            <Text style={[styles.rowLabel, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>SIGN OUT</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, maxHeight: '70%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 10, letterSpacing: 1.4 },
  closeBtn: { width: 34, height: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 12, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1 },
  rowLabel: { flex: 1, fontSize: 12, letterSpacing: 1.2 },
  section: { borderBottomWidth: 1, paddingVertical: 14 },
  sectionLabel: { fontSize: 9, letterSpacing: 1.4, marginBottom: 10 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1 },
  chipText: { fontSize: 10, letterSpacing: 1 },
});
