import React, { useState } from 'react';
import { Sheet, Field, SheetTextInput, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';

interface Props { open: boolean; onClose: () => void; }

export function AddApplicationSheet({ open, onClose }: Props) {
  const addApplication = useStore(s => s.addApplication);
  const [co, setCo] = useState('');
  const [role, setRole] = useState('');
  const [comp, setComp] = useState('');

  function submit() {
    if (!co.trim()) return;
    addApplication({ co, role, comp });
    setCo(''); setRole(''); setComp('');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="add application">
      <Field label="COMPANY">
        <SheetTextInput value={co} onChangeText={setCo} placeholder="acme corp..." />
      </Field>
      <Field label="ROLE">
        <SheetTextInput value={role} onChangeText={setRole} placeholder="senior engineer..." />
      </Field>
      <Field label="COMP / RANGE">
        <SheetTextInput value={comp} onChangeText={setComp} placeholder="$120k-$150k..." prefix="$" />
      </Field>
      <SubmitBtn onPress={submit}>ADD APPLICATION</SubmitBtn>
    </Sheet>
  );
}
