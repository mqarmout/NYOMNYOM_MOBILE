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
import type { Task, TaskTag, TaskCol } from '../data/types';
const TABS = ['BOARD', 'REPOS'];

const TAG_COLORS: Record<TaskTag, string> = {
  feat:   '#3aff7a',
  bug:    '#ff6a5a',
  design: '#7ab5ff',
  polish: '#ffc55a',
  ui:     '#ffa83c',
  sec:    '#ff6a5a',
};

const COLS: { id: TaskCol; label: string }[] = [
  { id: 'todo',   label: 'TODO'   },
  { id: 'doing',  label: 'DOING'  },
  { id: 'review', label: 'REVIEW' },
  { id: 'done',   label: 'DONE'   },
];

interface Props { onAddTask: () => void; }

export function ProjectsScreen({ onAddTask }: Props) {
  const theme = useTheme();
  const projects = useStore(s => s.data.projects);
  const syncFromServer = useStore(s => s.syncFromServer);
  const [tab, setTab] = useState(0);

  return (
    <CRTScreen title="PROJECTS">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && COLS.map(col => {
          const tasks = projects.board[col.id] ?? [];
          return (
            <Box key={col.id} title={`${col.label} (${tasks.length})`}>
              {tasks.length === 0 && <Comment>{'// empty'}</Comment>}
              {tasks.map(task => (
                <View key={task.id} style={[styles.taskCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <View style={styles.taskHeader}>
                    <Text style={[styles.taskTag, { color: TAG_COLORS[task.tag] ?? theme.accent, fontFamily: FONTS.jetbrains }]}>
                      {`[${task.tag.toUpperCase()}]`}
                    </Text>
                    <Text style={[styles.taskEst, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{task.est}</Text>
                    {task.hot && <Text style={[styles.hotTag, { color: '#ff6a5a', fontFamily: FONTS.jetbrains }]}>HOT</Text>}
                  </View>
                  <Text style={[styles.taskTitle, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{task.title}</Text>
                  <Mono style={{ color: theme.muted, fontSize: 10 }}>{`${task.sec} · ${fmtDay(task.createdAt)}`}</Mono>
                </View>
              ))}
            </Box>
          );
        })}

        {tab === 1 && (
          <Box title={`REPOS (${projects.repos.length})`}>
            {projects.repos.map((repo, i) => (
              <View key={i} style={[styles.repoRow, { borderBottomColor: theme.border }]}>
                <View style={styles.repoLeft}>
                  <View style={styles.repoHeader}>
                    <View style={[styles.repoDot, { backgroundColor: repo.active ? theme.accent : theme.muted }]} />
                    <Text style={[styles.repoName, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{repo.name}</Text>
                    <Text style={[styles.repoLang, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{repo.lang}</Text>
                  </View>
                  <View style={styles.repoMeta}>
                    <Mono style={{ color: theme.muted, fontSize: 10 }}>{`todo:${repo.todo} doing:${repo.doing} done:${repo.done}`}</Mono>
                  </View>
                </View>
                <Mono style={{ color: theme.muted, fontSize: 10 }}>{repo.last}</Mono>
              </View>
            ))}
          </Box>
        )}

      </PullToRefresh>
      <Fab onPress={onAddTask} />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  taskCard: { borderWidth: 1, padding: 10, marginBottom: 6, gap: 4 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskTag: { fontSize: 10, letterSpacing: 0.8 },
  taskEst: { fontSize: 10, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  hotTag: { fontSize: 9, letterSpacing: 1 },
  taskTitle: { fontSize: 13 },
  repoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  repoLeft: { flex: 1, gap: 4 },
  repoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  repoDot: { width: 6, height: 6, borderRadius: 3 },
  repoName: { flex: 1, fontSize: 13 },
  repoLang: { fontSize: 10 },
  repoMeta: {},
});
