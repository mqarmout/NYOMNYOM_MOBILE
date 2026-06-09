import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';

interface Props { open: boolean; onClose: () => void; }

const BOULDER_GRADES = ['VB','V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13'];
const SPORT_GRADES   = ['5a','5b','5c','6a','6a+','6b','6b+','6c','6c+','7a','7a+','7b','7b+','7c','7c+','8a','8a+','8b','8b+','8c','8c+','9a'];
const CLIMB_TYPES    = ['boulder', 'sport'];
const STYLES         = ['redpoint', 'flash', 'onsight', 'project'];

export function LogSendSheet({ open, onClose }: Props) {
  const logSend = useStore(s => s.logSend);
  const theme = useTheme();
  const [climbType, setClimbType] = useState('boulder');
  const [route, setRoute]         = useState('');
  const [grade, setGrade]         = useState('V4');
  const [style, setStyle]         = useState('redpoint');
  const [gym, setGym]             = useState('');
  const [attempts, setAttempts]   = useState('1');
  const [photo, setPhoto]         = useState<{ uri: string; type: string; name: string } | null>(null);

  const grades = climbType === 'sport' ? SPORT_GRADES : BOULDER_GRADES;

  function handleTypeChange(t: string) {
    setClimbType(t);
    setGrade(t === 'sport' ? '6a' : 'V4');
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext   = (asset.uri.split('.').pop() ?? 'jpg').toLowerCase();
      setPhoto({ uri: asset.uri, type: `image/${ext}`, name: `climb.${ext}` });
    }
  }

  function submit() {
    logSend({
      route,
      grade,
      style: style as 'flash' | 'onsight' | 'redpoint' | 'project',
      gym,
      climb_type: climbType,
      attempts: Math.max(1, parseInt(attempts) || 1),
      photo: photo ?? undefined,
    });
    setRoute(''); setGrade('V4'); setStyle('redpoint'); setGym('');
    setAttempts('1'); setPhoto(null); setClimbType('boulder');
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="log send">
      <Field label="TYPE">
        <Choice options={CLIMB_TYPES} value={climbType} onChange={handleTypeChange} />
      </Field>
      <Field label="ROUTE NAME">
        <SheetTextInput value={route} onChangeText={setRoute} placeholder="the crimpy one..." />
      </Field>
      <Field label="GRADE">
        <Choice options={grades} value={grade} onChange={setGrade} />
      </Field>
      <Field label="STYLE">
        <Choice options={STYLES} value={style} onChange={setStyle} />
      </Field>
      <Field label="ATTEMPTS">
        <SheetTextInput
          value={attempts}
          onChangeText={setAttempts}
          placeholder="1"
          keyboardType="numeric"
        />
      </Field>
      <Field label="GYM / CRAG (OPTIONAL)">
        <SheetTextInput value={gym} onChangeText={setGym} placeholder="hive bouldering..." />
      </Field>
      <Field label="PHOTO (OPTIONAL)">
        <Pressable
          onPress={pickPhoto}
          style={[styles.photoBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
          ) : (
            <Text style={[styles.photoBtnText, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
              TAP TO ADD PHOTO
            </Text>
          )}
        </Pressable>
      </Field>
      <SubmitBtn onPress={submit}>LOG SEND</SubmitBtn>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  photoBtn: { borderWidth: 1, borderStyle: 'dashed', height: 90, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoBtnText: { fontSize: 11, letterSpacing: 1 },
});
