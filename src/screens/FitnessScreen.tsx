import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { AreaSpark } from '../components/crt/charts/AreaSpark';
import { Bars } from '../components/crt/charts/Bars';
import { Fab } from '../components/crt/Fab';
import { fmtDay, fmtDuration, fmtPace } from '../utils/format';

const TABS = ['WORKOUTS', 'RUNNING', 'BODY'];

const DOW_ABBR = ['M','T','W','T','F','S','S'];

interface Props { onLogWorkout: () => void; }

export function FitnessScreen({ onLogWorkout }: Props) {
  const theme = useTheme();
  const fitness = useStore(s => s.data.fitness);
  const syncFromServer = useStore(s => s.syncFromServer);
  const [tab, setTab] = useState(0);

  return (
    <CRTScreen>
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
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
                    <View style={[
                      styles.dowDot,
                      { backgroundColor: (fitness.weekSessions[i] ?? 0) > 0 ? theme.accent : theme.surface2 }
                    ]} />
                    <Mono style={{ color: theme.muted, fontSize: 9 }}>{d}</Mono>
                  </View>
                ))}
              </View>
              <Bars values={fitness.weekSessions} height={40} />
            </Box>

            <Box title={`SESSIONS (${fitness.workouts.length})`}>
              {fitness.workouts.slice(0, 30).map(w => (
                <View key={w.id} style={[styles.workoutRow, { borderBottomColor: theme.border }]}>
                  <View style={styles.workoutLeft}>
                    <Text style={[styles.workoutName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{w.name}</Text>
                    <Mono style={{ color: theme.muted, fontSize: 10 }}>{`${w.sets} sets · ${fmtDay(w.createdAt)}`}</Mono>
                  </View>
                  <Text style={[styles.workoutDur, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{`${w.min}m`}</Text>
                </View>
              ))}
            </Box>
          </>
        )}

        {tab === 1 && (
          <>
            <Box title="RUN VOLUME (KM/WEEK)">
              <AreaSpark values={fitness.runWeekKm} height={80} />
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
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// current'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{`${fitness.weight}kg`}</Text>
                </View>
              </View>
              <AreaSpark values={fitness.weightHistory} height={80} />
            </Box>
          </>
        )}
      </PullToRefresh>
      <Fab onPress={onLogWorkout} />
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
  workoutName: { fontSize: 13 },
  workoutDur: { fontSize: 13 },
});
