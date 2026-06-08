import React from 'react';
import {
  Modal, View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { PixelIcon } from './PixelIcon';
import { haptic } from '../../native/haptics';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const theme = useTheme();
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerComment, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                {'// ' + title}
              </Text>
              <Text style={[styles.headerHero, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                {'> new entry_'}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.closeBtn, { borderColor: theme.borderHi, backgroundColor: theme.surface }]}
              accessibilityLabel="Close"
            >
              <PixelIcon kind="x" size={14} color={theme.accentDim} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{label}</Text>
      {children}
    </View>
  );
}

export function SheetTextInput({
  value, onChangeText, placeholder, prefix = '>', keyboardType = 'default',
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
}) {
  const theme = useTheme();
  return (
    <View style={[styles.inputRow, { backgroundColor: theme.surface2, borderColor: theme.borderHi }]}>
      <Text style={[styles.inputPrefix, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{prefix}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboardType}
        style={[styles.input, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Choice({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const theme = useTheme();
  return (
    <View style={styles.choices}>
      {options.map(o => {
        const on = value === o;
        return (
          <Pressable
            key={o}
            onPress={() => { haptic.select(); onChange(o); }}
            style={[styles.chip, {
              backgroundColor: on ? theme.accent : theme.surface,
              borderColor: on ? theme.accent : theme.border,
            }]}
          >
            <Text style={[styles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains, fontWeight: on ? '700' : '500' }]}>
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SubmitBtn({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => { haptic.commit(); onPress(); }}
      style={[styles.submitBtn, { backgroundColor: theme.accent }]}
      accessibilityRole="button"
    >
      <Text style={[styles.submitText, { color: theme.bg, fontFamily: FONTS.jetbrains }]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  scrim: { ...StyleSheet.absoluteFillObject },
  panel: { borderTopWidth: 1, maxHeight: '82%', flexDirection: 'column' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerComment: { fontSize: 9, letterSpacing: 1.4 },
  headerHero: { fontSize: 18, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, paddingBottom: 32 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.4, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, paddingHorizontal: 13, borderWidth: 1 },
  inputPrefix: { fontSize: 13 },
  input: { flex: 1, fontSize: 15 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, paddingVertical: 9, paddingHorizontal: 13, minHeight: 38, justifyContent: 'center' },
  chipText: { fontSize: 12 },
  submitBtn: { padding: 15, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 13, fontWeight: '700', letterSpacing: 2 },
});
