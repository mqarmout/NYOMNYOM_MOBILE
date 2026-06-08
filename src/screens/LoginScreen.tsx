import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { CRTScreen } from '../components/crt/CRTScreen';
import { haptic } from '../native/haptics';

export function LoginScreen() {
  const theme = useTheme();
  const login = useStore(s => s.login);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!name.trim()) { setErr('username required'); haptic.error(); return; }
    haptic.commit();
    setLoading(true);
    setErr('');
    await login(name.trim(), password.trim() || undefined);
    setLoading(false);
  }

  return (
    <CRTScreen>
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.accent, fontFamily: FONTS.jetbrains }]}>
              {'NYOMNYOM'}
            </Text>
            <Text style={[styles.sub, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
              {'// personal operating system'}
            </Text>
          </View>

          <View style={[styles.box, { borderColor: theme.borderHi, backgroundColor: theme.surface }]}>
            <Text style={[styles.boxTitle, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{'// LOGIN'}</Text>
            <Text style={[styles.prompt, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{'> enter username_'}</Text>

            <View style={[styles.inputRow, { backgroundColor: theme.surface2, borderColor: theme.borderHi }]}>
              <Text style={[styles.inputPrefix, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{'>'}</Text>
              <TextInput
                value={name}
                onChangeText={v => { setName(v); setErr(''); }}
                placeholder="username"
                placeholderTextColor={theme.muted}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                style={[styles.input, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}
              />
            </View>
            <View style={[styles.inputRow, { backgroundColor: theme.surface2, borderColor: theme.borderHi }]}>
              <Text style={[styles.inputPrefix, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{'*'}</Text>
              <TextInput
                value={password}
                onChangeText={v => { setPassword(v); setErr(''); }}
                placeholder="password"
                placeholderTextColor={theme.muted}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={[styles.input, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}
              />
            </View>

            {!!err && (
              <Text style={[styles.err, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>{err}</Text>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={[styles.btn, { backgroundColor: loading ? theme.accentDim : theme.accent }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, { color: theme.bg, fontFamily: FONTS.jetbrains }]}>
                {loading ? 'CONNECTING...' : 'BOOT SYSTEM'}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.footer, { color: theme.faint, fontFamily: FONTS.jetbrains }]}>
            {'v1.0.0 · local-first'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, letterSpacing: 6, fontWeight: '700' },
  sub: { fontSize: 11, letterSpacing: 1.2, marginTop: 6 },
  box: { borderWidth: 1, padding: 20 },
  boxTitle: { fontSize: 10, letterSpacing: 1.4, marginBottom: 12 },
  prompt: { fontSize: 16, marginBottom: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, padding: 12, gap: 10, marginBottom: 8 },
  inputPrefix: { fontSize: 14 },
  input: { flex: 1, fontSize: 15 },
  err: { fontSize: 11, marginBottom: 8 },
  btn: { padding: 15, alignItems: 'center', marginTop: 12 },
  btnText: { fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  footer: { textAlign: 'center', fontSize: 10, marginTop: 24 },
});
