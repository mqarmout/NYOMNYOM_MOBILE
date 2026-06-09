import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Sheet, Field, SheetTextInput, Choice, SubmitBtn } from '../../components/crt/Sheet';
import { useStore } from '../../state/store';
import { useTheme } from '../../theme/ThemeProvider';
import { FONTS } from '../../theme/type';
import { BASE_URL } from '../../api/config';
import type { Send } from '../../data/types';

interface Props { open: boolean; onClose: () => void; climb: Send | null; }

const BOULDER_GRADES = ['VB','V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12','V13'];
const SPORT_GRADES   = ['5.6','5.7','5.8','5.9','5.10a','5.10b','5.10c','5.10d','5.11a','5.11b','5.11c','5.11d','5.12a','5.12b','5.12c','5.12d','5.13a','5.13b','5.13c','5.13d','5.14a','5.14b','5.14c','5.14d'];
const CLIMB_TYPES    = ['boulder', 'sport'];
const STYLES         = ['redpoint', 'flash', 'onsight', 'project'];

export function EditClimbSheet({ open, onClose, climb }: Props) {
  const updateClimb = useStore(s => s.updateClimb);
  const theme = useTheme();

  const [climbType, setClimbType] = useState('boulder');
  const [route, setRoute]         = useState('');
  const [grade, setGrade]         = useState('V4');
  const [style, setStyle]         = useState('redpoint');
  const [gym, setGym]             = useState('');
  const [attempts, setAttempts]   = useState('1');
  const [photo, setPhoto]         = useState<{ uri: string; type: string; name: string } | null>(null);

  useEffect(() => {
    if (climb) {
      setClimbType(climb.climb_type ?? 'boulder');
      setRoute(climb.route);
      setGrade(climb.grade);
      setStyle(climb.style);
      setGym(climb.gym ?? '');
      setAttempts(String(climb.attempts ?? 1));
      setPhoto(null);
    }
  }, [climb]);

  const grades = climbType === 'sport' ? SPORT_GRADES : BOULDER_GRADES;

  function handleTypeChange(t: string) {
    setClimbType(t);
    if (t === 'sport' && !SPORT_GRADES.includes(grade)) setGrade('5.10a');
    if (t === 'boulder' && !BOULDER_GRADES.includes(grade)) setGrade('V4');
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const ext = (asset.uri.split('.').pop() ?? 'jpg').toLowerCase();
      setPhoto({ uri: asset.uri, type: `image/${ext}`, name: `climb.${ext}` });
    }
  }

  function submit() {
    if (!climb) return;
    updateClimb({
      id: climb.id,
      route,
      grade,
      style: style as 'flash' | 'onsight' | 'redpoint' | 'project',
      gym,
      climb_type: climbType,
      attempts: Math.max(1, parseInt(attempts) || 1),
      photo: photo ?? undefined,
    });
    onClose();
  }

  const existingPhotoUri = climb?.photo_path
    ? `${BASE_URL}/api/climbing/photos/${climb.photo_path}`
    : null;

  return (
    <Sheet open={open} onClose={onClose} title="edit send" subtitle="> update entry_">
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
        <SheetTextInput value={attempts} onChangeText={setAttempts} placeholder="1" keyboardType="numeric" />
      </Field>
      <Field label="GYM / CRAG (OPTIONAL)">
        <SheetTextInput value={gym} onChangeText={setGym} placeholder="hive bouldering..." />
      </Field>
      <Field label="PHOTO">
        <Pressable
          onPress={pickPhoto}
          style={[styles.photoBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
          ) : existingPhotoUri ? (
            <>
              <Image source={{ uri: existingPhotoUri }} style={styles.photoThumb} />
              <View style={styles.photoOverlay}>
                <Text style={[styles.photoOverlayText, { color: '#fff', fontFamily: FONTS.jetbrains }]}>TAP TO REPLACE</Text>
              </View>
            </>
          ) : (
            <Text style={[styles.photoBtnText, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
              TAP TO ADD PHOTO
            </Text>
          )}
        </Pressable>
      </Field>
      <SubmitBtn onPress={submit}>SAVE CHANGES</SubmitBtn>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  photoBtn: { borderWidth: 1, borderStyle: 'dashed', height: 90, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  photoOverlayText: { fontSize: 10, letterSpacing: 1 },
  photoBtnText: { fontSize: 11, letterSpacing: 1 },
});
