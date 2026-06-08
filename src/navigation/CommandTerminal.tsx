import React, { useState, useRef, useCallback } from 'react';
import {
  Modal, View, Text, TextInput, Pressable,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { haptic } from '../native/haptics';
import { useStore, PAGER } from '../state/store';
import type { SectionId } from '../data/types';
import type { PaletteName } from '../theme/palettes';
import type { FontName } from '../theme/type';

interface TermLine { id: number; text: string; kind: 'in' | 'out' | 'err' | 'ok'; }

const NAV_COMMANDS = PAGER.map(s => ({
  cmd: `nav ${s}`,
  desc: `go to ${s}`,
}));

const HELP_LINES = [
  '// NYOMNYOM TERMINAL v1.0',
  '',
  'NAVIGATION',
  '  nav <section>     — go to section',
  '  sections          — list sections',
  '',
  'MUTATIONS',
  '  add expense <merchant> <amt> [cat]',
  '  log workout <name> [min]',
  '  log send <grade> [style] [route]',
  '  log dose <tank> <what> [amt]',
  '  add job <company> <role> [comp]',
  '  add task <title> [tag]',
  '',
  'SYSTEM',
  '  theme <green|amber|cyan>  — set palette',
  '  font <jetbrains|plex|fira>',
  '  whoami                    — show profile',
  '  reset                     — reset seed data',
  '  clear                     — clear terminal',
  '  logout                    — sign out',
  '  help                      — show this',
];

function parseCommand(
  raw: string,
  store: ReturnType<typeof useStore.getState>,
): TermLine[] {
  const parts = raw.trim().split(/\s+/);
  const cmd = (parts[0] ?? '').toLowerCase();
  const args = parts.slice(1);

  if (cmd === 'help') {
    return HELP_LINES.map((t, i) => ({ id: i, text: t || ' ', kind: 'out' as const }));
  }

  if (cmd === 'clear') return [{ id: 0, text: '__CLEAR__', kind: 'ok' }];

  if (cmd === 'sections') {
    return [{ id: 0, text: PAGER.join('  '), kind: 'out' }];
  }

  if (cmd === 'whoami') {
    const u = store.data.user;
    return [
      { id: 0, text: `${u.name} · @${u.handle}`, kind: 'out' },
      { id: 1, text: `${u.role} · ${u.loc}`, kind: 'out' },
    ];
  }

  if (cmd === 'nav') {
    const s = args[0] as SectionId;
    if (PAGER.includes(s)) {
      store.go(s);
      return [{ id: 0, text: `→ navigated to ${s}`, kind: 'ok' }];
    }
    return [{ id: 0, text: `unknown section: ${args[0]}`, kind: 'err' }];
  }

  if (cmd === 'theme') {
    const name = args[0] as PaletteName;
    if (['green','amber','cyan'].includes(name)) {
      store.setPalette(name);
      return [{ id: 0, text: `palette set to ${name}`, kind: 'ok' }];
    }
    return [{ id: 0, text: 'usage: theme <green|amber|cyan>', kind: 'err' }];
  }

  if (cmd === 'font') {
    const name = args[0] as FontName;
    if (['jetbrains','plex','fira'].includes(name)) {
      store.setFont(name);
      return [{ id: 0, text: `font set to ${name}`, kind: 'ok' }];
    }
    return [{ id: 0, text: 'usage: font <jetbrains|plex|fira>', kind: 'err' }];
  }

  if (cmd === 'reset') {
    store.reset();
    return [{ id: 0, text: 'data reset to seed defaults', kind: 'ok' }];
  }

  if (cmd === 'logout') {
    store.logout();
    return [{ id: 0, text: 'session ended', kind: 'ok' }];
  }

  if (cmd === 'add' && args[0] === 'expense') {
    const merchant = args[1] ?? 'untitled';
    const amt = args[2] ?? '0';
    const cat = args[3] ?? 'misc';
    store.addExpense({ merchant, amt, cat });
    return [{ id: 0, text: `expense logged · $${amt} · ${merchant}`, kind: 'ok' }];
  }

  if (cmd === 'log' && args[0] === 'workout') {
    const name = args.slice(1, -1).join(' ') || args[1] || 'session';
    const min = args[args.length - 1];
    store.addWorkout({ name, min });
    return [{ id: 0, text: `workout logged · ${name}`, kind: 'ok' }];
  }

  if (cmd === 'log' && args[0] === 'send') {
    const grade = (args[1] ?? 'V2').toUpperCase();
    const style = (args[2] ?? 'redpoint') as 'flash' | 'onsight' | 'redpoint' | 'project';
    const route = args.slice(3).join(' ') || 'unnamed';
    store.logSend({ route, grade, style });
    return [{ id: 0, text: `send logged · ${grade} ${route}`, kind: 'ok' }];
  }

  if (cmd === 'log' && args[0] === 'dose') {
    const tank = args[1] ?? 'T1';
    const what = args[2] ?? 'flora-A';
    const amt = args[3] ?? '5ml';
    store.logDose({ tank, what, amt });
    return [{ id: 0, text: `dose logged · ${tank} ${what}`, kind: 'ok' }];
  }

  if (cmd === 'add' && args[0] === 'job') {
    const co = args[1] ?? 'company';
    const role = args[2] ?? 'engineer';
    const comp = args[3] ?? '—';
    store.addApplication({ co, role, comp });
    return [{ id: 0, text: `application added · ${co}`, kind: 'ok' }];
  }

  if (cmd === 'add' && args[0] === 'task') {
    const tag = args[args.length - 1] as 'feat' | 'bug' | 'design' | 'ui' | 'polish' | 'sec';
    const validTags = ['feat','bug','design','ui','polish','sec'];
    const hasTag = validTags.includes(tag);
    const title = hasTag ? args.slice(1, -1).join(' ') : args.slice(1).join(' ');
    store.addTask({ title: title || 'new task', tag: hasTag ? tag : 'feat' });
    return [{ id: 0, text: `task added · ${title || 'new task'}`, kind: 'ok' }];
  }

  if (!cmd) return [];
  return [{ id: 0, text: `command not found: ${cmd}  (type 'help')`, kind: 'err' }];
}

interface Props { open: boolean; onClose: () => void; }

let lineCounter = 1000;
function nextId() { return lineCounter++; }

export function CommandTerminal({ open, onClose }: Props) {
  const theme = useTheme();
  const store = useStore();
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TermLine[]>([
    { id: nextId(), text: '// NYOMNYOM TERMINAL — type help', kind: 'out' },
  ]);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const submit = useCallback(() => {
    if (!input.trim()) return;
    haptic.tap();
    const typed: TermLine = { id: nextId(), text: '> ' + input, kind: 'in' };
    const results = parseCommand(input, store);
    if (results[0]?.text === '__CLEAR__') {
      setLines([{ id: nextId(), text: '// cleared', kind: 'out' }]);
      setInput('');
      return;
    }
    setLines(prev => [...prev, typed, ...results.map(r => ({ ...r, id: nextId() }))]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }, [input, store]);

  function lineColor(kind: TermLine['kind']) {
    switch (kind) {
      case 'in':  return theme.accentHot;
      case 'ok':  return theme.accent;
      case 'err': return '#ff6a5a';
      default:    return theme.accentDim;
    }
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: theme.bg, borderColor: theme.borderHi }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// TERMINAL</Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { borderColor: theme.borderHi, backgroundColor: theme.surface }]}>
              <Text style={[styles.closeX, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.output}
            contentContainerStyle={styles.outputContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {lines.map(line => (
              <Text
                key={line.id}
                style={[styles.line, { color: lineColor(line.kind), fontFamily: FONTS.jetbrains }]}
              >
                {line.text}
              </Text>
            ))}
          </ScrollView>

          <View style={[styles.inputRow, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.prompt, { color: theme.accent, fontFamily: FONTS.jetbrains }]}>{'>'}</Text>
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={submit}
              style={[styles.inputField, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}
              placeholderTextColor={theme.muted}
              placeholder="type command..."
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="send"
              blurOnSubmit={false}
            />
            <Pressable onPress={submit} style={[styles.enterBtn, { borderColor: theme.borderHi }]}>
              <Text style={[styles.enterText, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>↵</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  panel: { borderWidth: 1, margin: 12, maxHeight: '72%', flexDirection: 'column' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  title: { fontSize: 10, letterSpacing: 1.4 },
  closeBtn: { width: 30, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  closeX: { fontSize: 18, lineHeight: 22 },
  output: { flex: 1 },
  outputContent: { padding: 12, paddingBottom: 4, gap: 2 },
  line: { fontSize: 12, lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  prompt: { fontSize: 14 },
  inputField: { flex: 1, fontSize: 13, paddingVertical: 4 },
  enterBtn: { width: 34, height: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  enterText: { fontSize: 18, lineHeight: 22 },
});
