import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sheet, Field, SheetTextInput, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { haptic } from '../../native/haptics';
import type { Expense } from '../../data/types';

interface Props { open: boolean; onClose: () => void; expense: Expense | null; }

export function EditExpenseSheet({ open, onClose, expense }: Props) {
  const theme = useTheme();
  const updateExpense = useStore(s => s.updateExpense);
  const deleteExpense = useStore(s => s.deleteExpense);
  const cats   = useStore(s => s.data.spending.cats);
  const catIds = useStore(s => s.data.spending.catIds);

  const [merchant, setMerchant] = useState('');
  const [amt, setAmt]           = useState('');
  const [cat, setCat]           = useState('');
  const [date, setDate]         = useState('');

  useEffect(() => {
    if (expense) {
      setMerchant(expense.merchant);
      setAmt(String(expense.amt));
      setCat(expense.cat);
      setDate(expense.date ?? expense.createdAt.slice(0, 10));
    }
  }, [expense]);

  function submit() {
    if (!expense) return;
    const a = parseFloat(amt);
    const resolvedCatId = catIds[cat] ?? expense.catId;
    if (!a || !merchant || !resolvedCatId) return;
    updateExpense({ id: expense.id, merchant, amt: a, cat, catId: resolvedCatId, date });
    onClose();
  }

  function handleDelete() {
    if (!expense) return;
    haptic.error();
    deleteExpense(expense.id);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="edit expense" subtitle="> update entry_">
      <Field label="MERCHANT">
        <SheetTextInput value={merchant} onChangeText={setMerchant} placeholder="coffee shop..." />
      </Field>
      <Field label="AMOUNT">
        <SheetTextInput value={amt} onChangeText={setAmt} placeholder="0.00" keyboardType="decimal-pad" />
      </Field>
      <Field label="DATE (YYYY-MM-DD)">
        <SheetTextInput value={date} onChangeText={setDate} placeholder="2025-01-01" />
      </Field>
      <Field label="CATEGORY">
        <View style={styles.catGrid}>
          {cats.map(c => {
            const on = c.name === cat;
            return (
              <Pressable
                key={c.name}
                onPress={() => { haptic.select(); setCat(c.name); }}
                style={[styles.chip, {
                  backgroundColor: on ? theme.accent : theme.surface,
                  borderColor: on ? theme.accent : theme.border,
                }]}
              >
                <Text style={[styles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>
      <SubmitBtn onPress={submit}>SAVE CHANGES</SubmitBtn>
      <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: '#ff6a5a' }]}>
        <Text style={[styles.deleteTxt, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>DELETE EXPENSE</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 10 },
  chipText: { fontSize: 11 },
  deleteBtn: { borderWidth: 1, padding: 14, alignItems: 'center', marginTop: 8 },
  deleteTxt: { fontSize: 12, letterSpacing: 1.2 },
});
