import React, { useState } from 'react';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';

interface Props { open: boolean; onClose: () => void; }

const WORKOUT_TYPES = ['strength', 'cardio', 'mobility', 'hiit', 'other'];

export function LogWorkoutSheet({ open, onClose }: Props) {
  const addWorkout = useStore(s => s.addWorkout);
  const [name, setName] = useState('');
  const [min, setMin] = useState('45');
  const [type, setType] = useState('strength');

  function submit() {
    addWorkout({ name: name || type, min });
    setName(''); setMin('45'); setType('strength');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="log workout">
      <Field label="SESSION NAME">
        <SheetTextInput value={name} onChangeText={setName} placeholder="upper body push..." />
      </Field>
      <Field label="DURATION (MIN)">
        <SheetTextInput value={min} onChangeText={setMin} placeholder="45" keyboardType="numeric" />
      </Field>
      <Field label="TYPE">
        <Choice options={WORKOUT_TYPES} value={type} onChange={setType} />
      </Field>
      <SubmitBtn onPress={submit}>LOG SESSION</SubmitBtn>
    </Sheet>
  );
}
