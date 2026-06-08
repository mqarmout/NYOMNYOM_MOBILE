import React, { useState } from 'react';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';

interface Props { open: boolean; onClose: () => void; }

const TAGS = ['feat', 'bug', 'design', 'ui', 'polish', 'sec'];

export function AddTaskSheet({ open, onClose }: Props) {
  const addTask = useStore(s => s.addTask);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('feat');

  function submit() {
    if (!title.trim()) return;
    addTask({ title, tag });
    setTitle(''); setTag('feat');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="add task">
      <Field label="TASK TITLE">
        <SheetTextInput value={title} onChangeText={setTitle} placeholder="implement dark mode..." />
      </Field>
      <Field label="TAG">
        <Choice options={TAGS} value={tag} onChange={setTag} />
      </Field>
      <SubmitBtn onPress={submit}>ADD TASK</SubmitBtn>
    </Sheet>
  );
}
