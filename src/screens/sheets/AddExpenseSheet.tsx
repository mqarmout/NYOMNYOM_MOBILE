import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { haptic } from '../../native/haptics';

const FALLBACK_CATS = ['food', 'transport', 'fitness', 'shopping', 'bills', 'misc'];

function today() { return new Date().toISOString().slice(0, 10); }

interface Props { open: boolean; onClose: () => void; }

export function AddExpenseSheet({ open, onClose }: Props) {
  const theme = useTheme();
  const addExpense = useStore(s => s.addExpense);
  const addIncome  = useStore(s => s.addIncome);
  const storeCats  = useStore(s => s.data.spending.cats);
  const txns       = useStore(s => s.data.spending.txns);
  const catOptions = storeCats.length > 0 ? storeCats.map(c => c.name) : FALLBACK_CATS;

  const [type, setType]               = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant]       = useState('');
  const [amt, setAmt]                 = useState('');
  const [cat, setCat]                 = useState(() => catOptions[0] ?? 'misc');
  const [incomeDesc, setIncomeDesc]   = useState('');
  const [source, setSource]           = useState('');
  const [date, setDate]               = useState(today);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Unique merchant targets from past transactions
  const allTargets = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of txns) {
      const val = t.target ?? t.merchant;
      if (val && !seen.has(val)) { seen.add(val); out.push(val); }
    }
    return out;
  }, [txns]);

  const suggestions = useMemo(() => {
    if (!merchant.trim()) return [];
    const q = merchant.toLowerCase();
    return allTargets.filter(t => t.toLowerCase().includes(q) && t.toLowerCase() !== q).slice(0, 5);
  }, [merchant, allTargets]);

  useEffect(() => {
    setCat(prev => catOptions.includes(prev) ? prev : (catOptions[0] ?? 'misc'));
  }, [catOptions]);

  useEffect(() => {
    if (open) {
      setType('expense');
      setDescription(''); setMerchant(''); setAmt(''); setCat(catOptions[0] ?? 'misc');
      setIncomeDesc(''); setSource(''); setDate(today());
      setShowSuggestions(false);
    }
  }, [open]);

  function submit() {
    if (!amt) return;
    if (type === 'expense') {
      addExpense({ merchant: description || 'untitled', target: merchant.trim() || undefined, amt, cat });
    } else {
      const a = Math.abs(parseFloat(amt) || 0);
      if (!a) return;
      addIncome({ description: incomeDesc || 'untitled', amount: a, source: source || 'other', date });
    }
    onClose();
  }

  const switchType = (t: 'expense' | 'income') => { haptic.select(); setType(t); setAmt(''); };

  const pickSuggestion = (s: string) => {
    setMerchant(s);
    setShowSuggestions(false);
    haptic.select();
  };

  return (
    <Sheet open={open} onClose={onClose} title="new entry">
      {/* Type toggle */}
      <View style={styles.toggle}>
        {(['expense', 'income'] as const).map(t => {
          const on = type === t;
          return (
            <Pressable key={t} onPress={() => switchType(t)}
              style={[styles.toggleBtn, {
                backgroundColor: on ? theme.accent : theme.surface,
                borderColor: on ? theme.accent : theme.border,
              }]}>
              <Text style={[styles.toggleText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                {t.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {type === 'expense' ? (
        <>
          <Field label="DESCRIPTION">
            <SheetTextInput value={description} onChangeText={setDescription} placeholder="lunch, coffee, groceries..." />
          </Field>
          <Field label="MERCHANT">
            <SheetTextInput
              value={merchant}
              onChangeText={v => { setMerchant(v); setShowSuggestions(true); }}
              placeholder="Subway, Netflix, Amazon..."
            />
            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestions, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {suggestions.map(s => (
                  <Pressable key={s} onPress={() => pickSuggestion(s)}
                    style={[styles.suggestion, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.suggestionText, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Field>
          <Field label="AMOUNT">
            <SheetTextInput value={amt} onChangeText={setAmt} placeholder="0.00" keyboardType="decimal-pad" prefix="$" />
          </Field>
          <Field label="CATEGORY">
            <Choice options={catOptions} value={cat} onChange={setCat} />
          </Field>
          <SubmitBtn onPress={submit}>LOG EXPENSE</SubmitBtn>
        </>
      ) : (
        <>
          <Field label="DESCRIPTION">
            <SheetTextInput value={incomeDesc} onChangeText={setIncomeDesc} placeholder="salary, freelance, bonus..." />
          </Field>
          <Field label="AMOUNT">
            <SheetTextInput value={amt} onChangeText={setAmt} placeholder="0.00" keyboardType="decimal-pad" prefix="$" />
          </Field>
          <Field label="SOURCE">
            <SheetTextInput value={source} onChangeText={setSource} placeholder="employer, client..." />
          </Field>
          <Field label="DATE (YYYY-MM-DD)">
            <SheetTextInput value={date} onChangeText={setDate} placeholder="2025-01-01" />
          </Field>
          <SubmitBtn onPress={submit}>LOG INCOME</SubmitBtn>
        </>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleBtn: { flex: 1, borderWidth: 1, paddingVertical: 9, alignItems: 'center' },
  toggleText: { fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  suggestions: { borderWidth: 1, borderTopWidth: 0, marginTop: -1 },
  suggestion: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1 },
  suggestionText: { fontSize: 13 },
});
