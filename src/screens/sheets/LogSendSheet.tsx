import React, { useState } from 'react';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';

interface Props { open: boolean; onClose: () => void; }

const GRADES = ['V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12'];
const STYLES = ['redpoint', 'flash', 'onsight', 'project'];

export function LogSendSheet({ open, onClose }: Props) {
  const logSend = useStore(s => s.logSend);
  const [route, setRoute] = useState('');
  const [grade, setGrade] = useState('V4');
  const [style, setStyle] = useState('redpoint');
  const [gym, setGym] = useState('');

  function submit() {
    logSend({ route, grade, style: style as 'flash' | 'onsight' | 'redpoint' | 'project', gym });
    setRoute(''); setGrade('V4'); setStyle('redpoint'); setGym('');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="log send">
      <Field label="ROUTE NAME">
        <SheetTextInput value={route} onChangeText={setRoute} placeholder="the crimpy one..." />
      </Field>
      <Field label="GRADE">
        <Choice options={GRADES} value={grade} onChange={setGrade} />
      </Field>
      <Field label="STYLE">
        <Choice options={STYLES} value={style} onChange={setStyle} />
      </Field>
      <Field label="GYM (OPTIONAL)">
        <SheetTextInput value={gym} onChangeText={setGym} placeholder="hive bouldering..." />
      </Field>
      <SubmitBtn onPress={submit}>LOG SEND</SubmitBtn>
    </Sheet>
  );
}
