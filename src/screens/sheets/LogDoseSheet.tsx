import React, { useState } from 'react';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';

interface Props { open: boolean; onClose: () => void; }

const NUTRIENTS = ['flora-A', 'flora-B', 'cal-mag', 'pH-up', 'pH-down', 'other'];

export function LogDoseSheet({ open, onClose }: Props) {
  const logDose = useStore(s => s.logDose);
  const tanks = useStore(s => s.data.hydro.tanks);
  const [tank, setTank] = useState(tanks[0]?.id ?? 'T1');
  const [what, setWhat] = useState('flora-A');
  const [amt, setAmt] = useState('5ml');

  const tankOptions = tanks.map(t => t.id);

  function submit() {
    logDose({ tank, what, amt });
    setWhat('flora-A'); setAmt('5ml');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="log dose">
      <Field label="TANK">
        <Choice options={tankOptions.length > 0 ? tankOptions : ['T1']} value={tank} onChange={setTank} />
      </Field>
      <Field label="NUTRIENT">
        <Choice options={NUTRIENTS} value={what} onChange={setWhat} />
      </Field>
      <Field label="AMOUNT">
        <SheetTextInput value={amt} onChangeText={setAmt} placeholder="5ml..." />
      </Field>
      <SubmitBtn onPress={submit}>LOG DOSE</SubmitBtn>
    </Sheet>
  );
}
