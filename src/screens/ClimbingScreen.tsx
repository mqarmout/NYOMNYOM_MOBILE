import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore, climbStats } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { GradePyramid } from '../components/crt/charts/GradePyramid';
import { Fab } from '../components/crt/Fab';
import { fmtDay } from '../utils/format';
import { BASE_URL } from '../api/config';
import type { Send } from '../data/types';

const TABS = ['LOG', 'PYRAMID', 'STATS'];

const STYLE_COLORS: Record<Send['style'], string> = {
  flash:    '#3aff7a',
  onsight:  '#7ab5ff',
  redpoint: '#ffa83c',
  project:  '#ff6a5a',
};

interface Props { onLogSend: () => void; }

export function ClimbingScreen({ onLogSend }: Props) {
  const theme = useTheme();
  const climbing = useStore(s => s.data.climbing);
  const syncFromServer = useStore(s => s.syncFromServer);
  const [tab, setTab] = useState(0);
  const stats = climbStats(climbing);

  return (
    <CRTScreen title="CLIMBING">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && (
          <Box title={`SENDS (${climbing.sends.length})`}>
            {climbing.sends.map(s => (
              <View key={s.id} style={[styles.sendRow, { borderBottomColor: theme.border }]}>
                {s.photo_path ? (
                  <Image
                    source={{ uri: `${BASE_URL}/api/climbing/photos/${s.photo_path}` }}
                    style={[styles.photo, { borderColor: STYLE_COLORS[s.style] ?? theme.border }]}
                  />
                ) : (
                  <View style={[styles.grade, { borderColor: STYLE_COLORS[s.style] ?? theme.border }]}>
                    <Text style={[styles.gradeText, { color: STYLE_COLORS[s.style] ?? theme.accent, fontFamily: FONTS.jetbrains }]}>{s.grade}</Text>
                  </View>
                )}
                <View style={styles.sendInfo}>
                  <Text style={[styles.sendRoute, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{s.route}</Text>
                  <View style={styles.sendMeta}>
                    <Text style={[styles.typeTag, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                      {`[${(s.climb_type ?? 'boulder').toUpperCase()}]`}
                    </Text>
                    <Text style={[styles.gradeTag, { color: STYLE_COLORS[s.style] ?? theme.muted, fontFamily: FONTS.jetbrains }]}>
                      {s.grade}
                    </Text>
                    <Text style={[styles.sendStyle, { color: STYLE_COLORS[s.style] ?? theme.muted, fontFamily: FONTS.jetbrains }]}>
                      {`${s.style.toUpperCase()} · ${s.attempts}${s.attempts === 1 ? ' try' : ' tries'}`}
                    </Text>
                  </View>
                  {s.gym ? (
                    <Mono style={{ color: theme.muted, fontSize: 10 }}>{s.gym}</Mono>
                  ) : null}
                </View>
                <Mono style={{ color: theme.muted, fontSize: 10 }}>{fmtDay(s.createdAt)}</Mono>
              </View>
            ))}
          </Box>
        )}

        {tab === 1 && (
          <Box title="GRADE PYRAMID">
            <GradePyramid pyramid={climbing.pyramid} />
          </Box>
        )}

        {tab === 2 && (
          <Box title="STATS">
            {[
              ['total sends', stats.sent],
              ['max grade', stats.max],
              ['flashes', stats.flashes],
              ['projects', stats.projects],
            ].map(([label, val], i) => (
              <View key={i} style={[styles.statRow, { borderBottomColor: theme.border }]}>
                <Mono style={{ color: theme.muted }}>{String(label)}</Mono>
                <Text style={[styles.statVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{String(val)}</Text>
              </View>
            ))}

            <Comment style={{ marginTop: 12 }}>{'// style breakdown'}</Comment>
            {(['flash','onsight','redpoint','project'] as const).map(style => {
              const count = climbing.sends.filter(s => s.style === style).length;
              return (
                <View key={style} style={[styles.statRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.styleTag, { color: STYLE_COLORS[style], fontFamily: FONTS.jetbrains }]}>
                    {`[${style.toUpperCase()}]`}
                  </Text>
                  <Text style={[styles.statVal, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{count}</Text>
                </View>
              );
            })}
          </Box>
        )}
      </PullToRefresh>
      <Fab onPress={onLogSend} />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  sendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  photo: { width: 54, height: 54, borderWidth: 1, resizeMode: 'cover' },
  grade: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 13, fontWeight: '700' },
  sendInfo: { flex: 1, gap: 3 },
  sendRoute: { fontSize: 13 },
  sendMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeTag: { fontSize: 10, letterSpacing: 0.6 },
  gradeTag: { fontSize: 10, letterSpacing: 0.6 },
  sendStyle: { fontSize: 10, letterSpacing: 0.6 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  statVal: { fontSize: 16 },
  styleTag: { fontSize: 10, letterSpacing: 0.8 },
});
