import React, { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Sheet, Field, SheetTextInput, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { haptic } from '../../native/haptics';
import type { WorkoutSet } from '../../data/types';

interface Props {
  open: boolean; onClose: () => void;
  workoutId: string | null; set: WorkoutSet | null;
}

export function EditSetSheet({ open, onClose, workoutId, set }: Props) {
  const theme = useTheme();
  const updateWorkoutSet = useStore(s => s.updateWorkoutSet);
  const deleteWorkoutSet = useStore(s => s.deleteWorkoutSet);

  const [exercise, setExercise] = useState('');
  const [sets, setSets]         = useState('');
  const [reps, setReps]         = useState('');
  const [weight, setWeight]     = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (set) {
      setExercise(set.exercise);
      setSets(set.sets != null ? String(set.sets) : '');
      setReps(set.reps != null ? String(set.reps) : '');
      setWeight(set.weight != null ? String(set.weight) : '');
      setDuration(set.duration != null ? String(set.duration) : '');
    }
  }, [set]);

  function num(s: string): number | null {
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  function submit() {
    if (!set || !workoutId) return;
    updateWorkoutSet({
      workoutId,
      setId: set.id,
      exercise: exercise || set.exercise,
      sets: num(sets),
      reps: num(reps),
      weight: num(weight),
      duration: num(duration),
    });
    onClose();
  }

  function handleDelete() {
    if (!set || !workoutId) return;
    haptic.error();
    deleteWorkoutSet({ workoutId, setId: set.id });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="edit set" subtitle="> update exercise_">
      <Field label="EXERCISE">
        <SheetTextInput value={exercise} onChangeText={setExercise} placeholder="bench press..." />
      </Field>
      <Field label="SETS">
        <SheetTextInput value={sets} onChangeText={setSets} placeholder="3" keyboardType="numeric" />
      </Field>
      <Field label="REPS">
        <SheetTextInput value={reps} onChangeText={setReps} placeholder="8" keyboardType="numeric" />
      </Field>
      <Field label="WEIGHT (KG)">
        <SheetTextInput value={weight} onChangeText={setWeight} placeholder="60" keyboardType="decimal-pad" />
      </Field>
      <Field label="DURATION (SEC, if time-based)">
        <SheetTextInput value={duration} onChangeText={setDuration} placeholder="30" keyboardType="numeric" />
      </Field>
      <SubmitBtn onPress={submit}>SAVE CHANGES</SubmitBtn>
      <Pressable onPress={handleDelete} style={[styles.deleteBtn, { borderColor: '#ff6a5a' }]}>
        <Text style={[styles.deleteTxt, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>DELETE SET</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  deleteBtn: { borderWidth: 1, padding: 14, alignItems: 'center', marginTop: 8 },
  deleteTxt: { fontSize: 12, letterSpacing: 1.2 },
});
