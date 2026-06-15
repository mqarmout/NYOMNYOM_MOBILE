import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { Bars } from '../components/crt/charts/Bars';
import { AreaSpark } from '../components/crt/charts/AreaSpark';
import { Fab } from '../components/crt/Fab';
import { EditWorkoutSheet } from './sheets/EditWorkoutSheet';
import { EditSetSheet } from './sheets/EditSetSheet';
import { fmtDay, fmtDuration, fmtPace } from '../utils/format';
import type { Workout, WorkoutSet } from '../data/types';

const TABS = ['WORKOUTS', 'RUNNING', 'BODY'];
const DOW_ABBR = ['M','T','W','T','F','S','S'];

interface Props { onLogWorkout: () => void; }

export function FitnessScreen({ onLogWorkout }: Props) {
  const theme = useTheme();
  const fitness = useStore(s => s.data.fitness);
  const syncFromServer = useStore(s => s.syncFromServer);
  const stravaImport = useStore(s => s.stravaImport);
  const section = useStore(s => s.section);
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const addBodyWeight = useStore(s => s.addBodyWeight);
  const [editWorkout, setEditWorkout] = useState<Workout | null>(null);
  const [editSet, setEditSet] = useState<{ workoutId: string; set: WorkoutSet } | null>(null);
  const [weightModal, setWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().slice(0, 10));
  const [savingWeight, setSavingWeight] = useState(false);

  useEffect(() => { if (section !== 'fitness') { setTab(0); setExpandedId(null); } }, [section]);

  const handleSaveWeight = async () => {
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;
    setSavingWeight(true);
    await addBodyWeight({ weight: w, date: weightDate });
    setSavingWeight(false);
    setWeightInput('');
    setWeightDate(new Date().toISOString().slice(0, 10));
    setWeightModal(false);
  };

  const bodyStats = (() => {
    const h = fitness.weightHistory;
    if (!h.length) return null;
    const min = Math.min(...h);
    const max = Math.max(...h);
    const latest = h[h.length - 1] ?? 0;
    const prev = h[h.length - 2];
    const trend = prev != null ? latest - prev : 0;
    return { min, max, latest, trend };
  })();

  return (
    <CRTScreen title="FITNESS">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={tab === 1 ? stravaImport : syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && (
          <>
            <Box title="THIS WEEK">
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// streak'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{`${fitness.streak}d`}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// sessions'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{fitness.workouts.length}</Text>
                </View>
              </View>
              <View style={styles.dowRow}>
                {DOW_ABBR.map((d, i) => (
                  <View key={i} style={styles.dowCell}>
                    <View style={[styles.dowDot, { backgroundColor: (fitness.weekSessions[i] ?? 0) > 0 ? theme.accent : theme.surface2 }]} />
                    <Mono style={{ color: theme.muted, fontSize: 9 }}>{d}</Mono>
                  </View>
                ))}
              </View>
              <Bars values={fitness.weekSessions} height={40} />
            </Box>

            <Box title={`SESSIONS (${fitness.workouts.length})`}>
              {fitness.workouts.slice(0, 30).map(w => {
                const expanded = expandedId === w.id;
                return (
                  <View key={w.id}>
                    <Pressable
                      onPress={() => setExpandedId(expanded ? null : w.id)}
                      style={[styles.workoutRow, { borderBottomColor: theme.border }]}
                    >
                      <View style={styles.workoutLeft}>
                        <Text style={[styles.workoutName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{w.name}</Text>
                        <Mono style={{ color: theme.muted, fontSize: 10 }}>
                          {`${w.sets.length} sets · ${fmtDay(w.createdAt)}`}
                        </Mono>
                      </View>
                      <View style={styles.workoutRight}>
                        <Text style={[styles.workoutDur, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{`${w.min}m`}</Text>
                        <Pressable onPress={() => setEditWorkout(w)} style={[styles.editBtn, { borderColor: theme.borderHi }]}>
                          <Mono style={{ color: theme.muted, fontSize: 9 }}>EDIT</Mono>
                        </Pressable>
                      </View>
                    </Pressable>

                    {expanded && (
                      <View style={[styles.setsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                        {w.sets.length === 0 && (
                          <Mono style={{ color: theme.muted, fontSize: 10, padding: 10 }}>{'// no sets logged'}</Mono>
                        )}
                        {w.sets.map(s => (
                          <Pressable
                            key={s.id}
                            onPress={() => setEditSet({ workoutId: w.id, set: s })}
                            style={[styles.setRow, { borderBottomColor: theme.border }]}
                          >
                            <View style={styles.setLeft}>
                              <Text style={[styles.setExercise, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{s.exercise}</Text>
                              <Mono style={{ color: theme.muted, fontSize: 10 }}>
                                {[
                                  s.sets != null ? `${s.sets}×` : null,
                                  s.reps != null ? `${s.reps} reps` : null,
                                  s.weight != null ? `${s.weight}lbs` : null,
                                  s.duration != null ? `${s.duration}s` : null,
                                ].filter(Boolean).join(' · ')}
                              </Mono>
                            </View>
                            <Mono style={{ color: theme.muted, fontSize: 9 }}>TAP EDIT</Mono>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </Box>
          </>
        )}

        {tab === 1 && (
          <>
            <Box title="RUN VOLUME (KM/WEEK)">
              <AreaSpark values={fitness.runWeekKm} height={80} labels={fitness.runWeekLabels} allDots noFill />
            </Box>
            <Box title={`RUNS (${fitness.runs.length})`}>
              {fitness.runs.slice(0, 30).map(run => (
                <View key={run.id} style={[styles.workoutRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.workoutLeft}>
                    <Text style={[styles.workoutName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{run.label}</Text>
                    <Mono style={{ color: theme.muted, fontSize: 10 }}>
                      {`${run.distanceKm.toFixed(1)}km · ${fmtPace(run.paceSecPerKm)}`}
                    </Mono>
                  </View>
                  <Text style={[styles.workoutDur, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                    {fmtDuration(run.durationSec)}
                  </Text>
                </View>
              ))}
            </Box>
          </>
        )}

        {tab === 2 && (
          <>
            <Box title="BODY WEIGHT">
              {bodyStats ? (
                <>
                  <View style={styles.row}>
                    <View style={styles.statBlock}>
                      <Comment>{'// current'}</Comment>
                      <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{`${bodyStats.latest}lbs`}</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Comment>{'// min'}</Comment>
                      <Text style={[styles.bigNum, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{`${bodyStats.min}lbs`}</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Comment>{'// max'}</Comment>
                      <Text style={[styles.bigNum, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{`${bodyStats.max}lbs`}</Text>
                    </View>
                  </View>
                  {bodyStats.trend !== 0 && (
                    <Mono style={{ color: bodyStats.trend > 0 ? '#ffa83c' : '#3aff7a', marginBottom: 8 }}>
                      {bodyStats.trend > 0 ? `▲ +${bodyStats.trend.toFixed(1)}lbs since last entry` : `▼ ${bodyStats.trend.toFixed(1)}lbs since last entry`}
                    </Mono>
                  )}
                  <AreaSpark values={fitness.weightHistory} height={80} labels={fitness.weightDates} allDots noFill />
                </>
              ) : (
                <Mono style={{ color: theme.muted }}>{'// no weight data yet — tap [+] to log'}</Mono>
              )}
            </Box>

            {fitness.weightHistory.length > 0 && (
              <Box title="RECENT MEASUREMENTS">
                {fitness.weightDates.map((d, i) => (
                  <View key={i} style={[styles.metricRow, { borderBottomColor: theme.border }]}>
                    <Mono style={{ color: theme.muted }}>{d}</Mono>
                    <Text style={[styles.metricVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                      {`${fitness.weightHistory[i]}lbs`}
                    </Text>
                  </View>
                )).reverse()}
              </Box>
            )}
          </>
        )}
      </PullToRefresh>

      <Fab onPress={tab === 2 ? () => setWeightModal(true) : onLogWorkout} />

      {/* Weight entry modal */}
      <Modal visible={weightModal} transparent animationType="slide" onRequestClose={() => setWeightModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Pressable style={wStyles.scrim} onPress={() => setWeightModal(false)} />
          <View style={[wStyles.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
          <Text style={[wStyles.title, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// LOG WEIGHT</Text>
          <Text style={[wStyles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>WEIGHT (lbs)</Text>
          <TextInput
            style={[wStyles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="numeric"
            placeholder="e.g. 82.5"
            placeholderTextColor={theme.muted}
            autoFocus
          />
          <Text style={[wStyles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>DATE</Text>
          <TextInput
            style={[wStyles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
            value={weightDate}
            onChangeText={setWeightDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.muted}
          />
          <Pressable
            onPress={handleSaveWeight}
            disabled={savingWeight || !weightInput}
            style={[wStyles.btn, { backgroundColor: weightInput ? theme.accent : theme.surface, borderColor: theme.accent }]}
          >
            <Text style={[wStyles.btnText, { color: weightInput ? theme.bg : theme.muted, fontFamily: FONTS.jetbrains }]}>
              {savingWeight ? '...' : '[+] SAVE'}
            </Text>
          </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <EditWorkoutSheet
        open={editWorkout !== null}
        onClose={() => setEditWorkout(null)}
        workout={editWorkout}
      />
      <EditSetSheet
        open={editSet !== null}
        onClose={() => setEditSet(null)}
        workoutId={editSet?.workoutId ?? null}
        set={editSet?.set ?? null}
      />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statBlock: { flex: 1, gap: 2 },
  bigNum: { fontSize: 22, lineHeight: 26 },
  dowRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dowCell: { alignItems: 'center', gap: 4 },
  dowDot: { width: 10, height: 10, borderRadius: 5 },
  workoutRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  workoutLeft: { flex: 1, gap: 2 },
  workoutRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  workoutName: { fontSize: 13 },
  workoutDur: { fontSize: 13 },
  editBtn: { borderWidth: 1, paddingVertical: 4, paddingHorizontal: 6 },
  setsContainer: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4, borderBottomWidth: 1 },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  setLeft: { flex: 1, gap: 2 },
  setExercise: { fontSize: 12 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  metricVal: { fontSize: 14 },
});

const wStyles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { marginTop: 'auto', borderTopWidth: 1, padding: 24, paddingBottom: 48 },
  title: { fontSize: 10, letterSpacing: 1.4, marginBottom: 20 },
  label: { fontSize: 9, letterSpacing: 1.2, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, padding: 12, fontSize: 16 },
  btn: { marginTop: 24, padding: 14, borderWidth: 1, alignItems: 'center' },
  btnText: { fontSize: 12, letterSpacing: 1.2, fontWeight: '700' },
});
