import React, { useState, useEffect } from 'react';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';

const FALLBACK_CATS = ['food', 'transport', 'fitness', 'shopping', 'bills', 'misc'];

interface Props { open: boolean; onClose: () => void; }

export function AddExpenseSheet({ open, onClose }: Props) {
  const addExpense = useStore(s => s.addExpense);
  const storeCats = useStore(s => s.data.spending.cats);
  const catOptions = storeCats.length > 0 ? storeCats.map(c => c.name) : FALLBACK_CATS;
  const [merchant, setMerchant] = useState('');
  const [amt, setAmt] = useState('');
  const [cat, setCat] = useState(() => catOptions[0] ?? 'misc');

  useEffect(() => {
    setCat(prev => catOptions.includes(prev) ? prev : (catOptions[0] ?? 'misc'));
  }, [catOptions]);

  function submit() {
    if (!amt) return;
    addExpense({ merchant: merchant || 'untitled', amt, cat });
    setMerchant(''); setAmt(''); setCat('misc');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="add expense">
      <Field label="MERCHANT">
        <SheetTextInput value={merchant} onChangeText={setMerchant} placeholder="coffee lab..." />
      </Field>
      <Field label="AMOUNT">
        <SheetTextInput value={amt} onChangeText={setAmt} placeholder="0.00" keyboardType="decimal-pad" prefix="$" />
      </Field>
      <Field label="CATEGORY">
        <Choice options={catOptions} value={cat} onChange={setCat} />
      </Field>
      <SubmitBtn onPress={submit}>LOG EXPENSE</SubmitBtn>
    </Sheet>
  );
}
