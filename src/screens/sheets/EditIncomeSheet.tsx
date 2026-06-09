import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sheet, Field, SheetTextInput, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { haptic } from '../../native/haptics';
import type { IncomeEntry } from '../../data/types';

interface Props { open: boolean; onClose: () => void; income: IncomeEntry | null; }

export function EditIncomeSheet({ open, onClose, income }: Props) {
  const theme = useTheme();
  const updateIncome = useStore(s => s.updateIncome);
  const deleteIncome = useStore(s => s.deleteIncome);

  const [description, setDescription] = useState('');
  const [source, setSource]           = useState('');
  const [amt, setAmt]                 = useState('');
  const [date, setDate]               = useState('');

  useEffect(() => {
    if (income) {
      setDescription(income.description);
      setSource(income.source);
      setAmt(String(income.amt));
      setDate(income.date ?? income.createdAt.slice(0, 10));
    }
  }, [income]);

  function submit() {
    if (!income) return;
    const a = parseFloat(amt);
    if (!a || !description) return;
    updateIncome({ id: income.id, description, source, amt: a, date });
    onClose();
  }

  function handleDelete() {
    if (!income) return;
    haptic.error();
    deleteIncome(income.id);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="edit income" subtitle="> update entry_">
      <Field label="DESCRIPTION">
        <SheetTextInput value={description} onChangeText={setDescription} placeholder="salary, freelance..." />
      </Field>
      <Field label="SOURCE">
        <SheetTextInput value={source} onChangeText={setSource} placeholder="employer, client..." />
      </Field>
      <Field label="AMOUNT">
        <SheetTextInput value={amt} onChangeText={setAmt} placeholder="0.00" keyboardType="decimal-pad" />
      </Field>
      <Field label="DATE (YYYY-MM-DD)">
        <SheetTextInput value={date} onChangeText={setDate} placeholder="2025-01-01" />
      </Field>
      <SubmitBtn onPress={submit}>SAVE CHANGES</SubmitBtn>
      <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: '#ff6a5a' }]}>
        <Text style={[styles.deleteTxt, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>DELETE INCOME</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  deleteBtn: { borderWidth: 1, padding: 14, alignItems: 'center', marginTop: 8 },
  deleteTxt: { fontSize: 12, letterSpacing: 1.2 },
});
