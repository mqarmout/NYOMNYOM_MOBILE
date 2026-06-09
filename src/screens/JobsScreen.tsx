import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { Fab } from '../components/crt/Fab';
import { fmtDay } from '../utils/format';
import type { ColId } from '../data/types';
import { STATUS } from '../theme/palettes';

const TABS = ['BOARD', 'PIPELINE', 'STATS'];

const COL_COLORS: Record<ColId, string> = {
  applied:   '#7ab5ff',
  screening: '#ffc55a',
  interview: '#ffa83c',
  offer:     '#3aff7a',
  rejected:  '#ff6a5a',
};

interface Props { onAddJob: () => void; }

export function JobsScreen({ onAddJob }: Props) {
  const theme = useTheme();
  const data = useStore(s => s.data);
  const syncFromServer = useStore(s => s.syncFromServer);
  const [tab, setTab] = useState(0);
  const { board, cols } = data.jobs;

  const totalApps = Object.values(board).reduce((s, col) => s + col.length, 0);
  const active = (board.screening?.length ?? 0) + (board.interview?.length ?? 0);

  return (
    <CRTScreen title="JOBS">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && cols.map(col => {
          const jobs = board[col.id] ?? [];
          return (
            <Box key={col.id} title={`${col.label} (${jobs.length})`}>
              {jobs.length === 0 && (
                <Comment>{'// empty'}</Comment>
              )}
              {jobs.map(job => (
                <View key={job.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.dot, { backgroundColor: COL_COLORS[col.id] ?? theme.muted }]} />
                    <Text style={[styles.company, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{job.co}</Text>
                    {job.hot && <Text style={[styles.hot, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>HOT</Text>}
                  </View>
                  <Text style={[styles.role, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{job.role}</Text>
                  <View style={styles.cardMeta}>
                    <Mono style={{ color: theme.muted, fontSize: 10 }}>{job.comp}</Mono>
                    <Mono style={{ color: theme.muted, fontSize: 10 }}>{fmtDay(job.createdAt)}</Mono>
                  </View>
                </View>
              ))}
            </Box>
          );
        })}

        {tab === 1 && (
          <>
            {cols.map(col => {
              const jobs = board[col.id] ?? [];
              const pct = totalApps > 0 ? Math.round((jobs.length / totalApps) * 100) : 0;
              return (
                <View key={col.id} style={[styles.pipeRow, { borderColor: theme.border }]}>
                  <Text style={[styles.pipeLabel, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{col.label}</Text>
                  <View style={[styles.pipeTrack, { backgroundColor: theme.surface2 }]}>
                    <View style={[styles.pipeFill, { width: `${pct}%`, backgroundColor: COL_COLORS[col.id] ?? theme.accent }]} />
                  </View>
                  <Text style={[styles.pipeCount, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{jobs.length}</Text>
                </View>
              );
            })}
          </>
        )}

        {tab === 2 && (
          <Box title="STATS">
            {[
              ['total applications', totalApps],
              ['active (screen+interview)', active],
              ['offers received', board.offer?.length ?? 0],
              ['rejected', board.rejected?.length ?? 0],
              ['response rate', totalApps > 0 ? `${Math.round(((totalApps - (board.applied?.length ?? 0)) / totalApps) * 100)}%` : '—'],
            ].map(([label, val], i) => (
              <View key={i} style={[styles.statRow, { borderBottomColor: theme.border }]}>
                <Mono style={{ color: theme.muted }}>{String(label)}</Mono>
                <Text style={[styles.statVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{String(val)}</Text>
              </View>
            ))}
          </Box>
        )}
      </PullToRefresh>
      <Fab onPress={onAddJob} />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  card: { borderWidth: 1, padding: 12, marginBottom: 8, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  company: { flex: 1, fontSize: 14 },
  hot: { fontSize: 9, letterSpacing: 1 },
  role: { fontSize: 12 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  pipeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, borderBottomWidth: 1, paddingBottom: 8 },
  pipeLabel: { width: 90, fontSize: 11 },
  pipeTrack: { flex: 1, height: 10 },
  pipeFill: { height: 10 },
  pipeCount: { width: 24, fontSize: 12, textAlign: 'right' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  statVal: { fontSize: 14 },
});
