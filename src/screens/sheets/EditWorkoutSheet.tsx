import React, { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Sheet, Field, SheetTextInput, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { haptic } from '../../native/haptics';
import type { Workout } from '../../data/types';

interface Props { open: boolean; onClose: () => void; workout: Workout | null; }

export function EditWorkoutSheet({ open, onClose, workout }: Props) {
  const theme = useTheme();
  const updateWorkout = useStore(s => s.updateWorkout);
  const deleteWorkout = useStore(s => s.deleteWorkout);

  const [name, setName] = useState('');
  const [min, setMin]   = useState('');

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setMin(String(workout.min));
    }
  }, [workout]);

  function submit() {
    if (!workout) return;
    updateWorkout({ id: workout.id, name: name || workout.name, min: parseInt(min) || workout.min });
    onClose();
  }

  function handleDelete() {
    if (!workout) return;
    haptic.error();
    deleteWorkout(workout.id);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="edit workout" subtitle="> update session_">
      <Field label="SESSION NAME">
        <SheetTextInput value={name} onChangeText={setName} placeholder="Push day..." />
      </Field>
      <Field label="DURATION (MINUTES)">
        <SheetTextInput value={min} onChangeText={setMin} placeholder="45" keyboardType="numeric" />
      </Field>
      <SubmitBtn onPress={submit}>SAVE CHANGES</SubmitBtn>
      <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: '#ff6a5a' }]}>
        <Text style={[styles.deleteTxt, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>DELETE WORKOUT</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  deleteBtn: { borderWidth: 1, padding: 14, alignItems: 'center', marginTop: 8 },
  deleteTxt: { fontSize: 12, letterSpacing: 1.2 },
});
