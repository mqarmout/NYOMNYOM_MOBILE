import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, Image, Pressable, Modal, ScrollView, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore, climbStats } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { GradePyramid } from '../components/crt/charts/GradePyramid';
import { Fab } from '../components/crt/Fab';
import { EditClimbSheet } from './sheets/EditClimbSheet';
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

const VGRADE_NUM = (g: string) => {
  const m = g.match(/V(\d+)/i);
  return m ? parseInt(m[1]) : -1;
};

type FilterType = 'all' | 'sent' | 'project' | 'boulder' | 'sport';
type SortKey = 'date_desc' | 'date_asc' | 'grade_desc' | 'grade_asc' | 'attempts_desc';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',     label: 'ALL'     },
  { key: 'sent',    label: 'SENT'    },
  { key: 'project', label: 'PROJECT' },
  { key: 'boulder', label: 'BOULDER' },
  { key: 'sport',   label: 'SPORT'   },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'date_desc',    label: 'NEWEST'   },
  { key: 'date_asc',     label: 'OLDEST'   },
  { key: 'grade_desc',   label: 'HARDEST'  },
  { key: 'grade_asc',    label: 'EASIEST'  },
  { key: 'attempts_desc',label: 'ATTEMPTS' },
];

interface Props { onLogSend: () => void; }

export function ClimbingScreen({ onLogSend }: Props) {
  const theme = useTheme();
  const climbing = useStore(s => s.data.climbing);
  const syncFromServer = useStore(s => s.syncFromServer);
  const section = useStore(s => s.section);
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortKey>('date_desc');
  const stats = climbStats(climbing);

  useEffect(() => { if (section !== 'climbing') { setTab(0); setEditClimb(null); } }, [section]);

  const [editClimb, setEditClimb] = useState<Send | null>(null);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  const displayed = useMemo(() => {
    let list = [...(climbing.sends ?? [])];

    // filter
    if (filter === 'sent')    list = list.filter(s => s.style !== 'project');
    if (filter === 'project') list = list.filter(s => s.style === 'project');
    if (filter === 'boulder') list = list.filter(s => s.climb_type === 'boulder');
    if (filter === 'sport')   list = list.filter(s => s.climb_type === 'sport');

    // sort
    list.sort((a, b) => {
      switch (sort) {
        case 'date_asc':      return a.createdAt.localeCompare(b.createdAt);
        case 'date_desc':     return b.createdAt.localeCompare(a.createdAt);
        case 'grade_desc':    return VGRADE_NUM(b.grade) - VGRADE_NUM(a.grade);
        case 'grade_asc':     return VGRADE_NUM(a.grade) - VGRADE_NUM(b.grade);
        case 'attempts_desc': return (b.attempts ?? 1) - (a.attempts ?? 1);
        default: return 0;
      }
    });
    return list;
  }, [climbing.sends, filter, sort]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncFromServer().catch(() => {});
    setRefreshing(false);
  }, [syncFromServer]);

  const renderClimb = useCallback(({ item: s }: { item: Send }) => (
    <Pressable
      onPress={() => setEditClimb(s)}
      style={[styles.sendRow, { borderBottomColor: theme.border }]}
    >
      {s.photo_path ? (
        <Pressable onPress={() => setLightboxUri(`${BASE_URL}/api/climbing/photos/${s.photo_path}`)}>
          <Image
            source={{ uri: `${BASE_URL}/api/climbing/photos/${s.photo_path}` }}
            style={[styles.photo, { borderColor: STYLE_COLORS[s.style] ?? theme.border }]}
          />
        </Pressable>
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
        {s.gym ? <Mono style={{ color: theme.muted, fontSize: 10 }}>{s.gym}</Mono> : null}
      </View>
      <Mono style={{ color: theme.muted, fontSize: 10 }}>{fmtDay(s.createdAt)}</Mono>
    </Pressable>
  ), [theme, setEditClimb, setLightboxUri]);

  const listHeader = useMemo(() => (
    <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        <View style={styles.chipRow}>
          {FILTERS.map(f => {
            const on = filter === f.key;
            return (
              <Pressable key={f.key} onPress={() => setFilter(f.key)}
                style={[styles.chip, { backgroundColor: on ? theme.accent : theme.surface, borderColor: on ? theme.accent : theme.border }]}>
                <Text style={[styles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={styles.chipRow}>
          {SORTS.map(s => {
            const on = sort === s.key;
            return (
              <Pressable key={s.key} onPress={() => setSort(s.key)}
                style={[styles.chip, styles.chipSm, { backgroundColor: on ? theme.accentDim : 'transparent', borderColor: on ? theme.accentDim : theme.border }]}>
                <Text style={[styles.chipText, { color: on ? theme.bg : theme.muted, fontFamily: FONTS.jetbrains }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Text style={[styles.countLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
        {`// ${displayed.length} of ${climbing.sends.length}`}
      </Text>
    </View>
  ), [filter, sort, displayed.length, climbing.sends.length, theme]);

  return (
    <CRTScreen title="CLIMBING">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />

      {tab === 0 && (
        <FlatList
          data={displayed}
          keyExtractor={s => s.id}
          renderItem={renderClimb}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <View style={{ padding: 14 }}>
              <Mono style={{ color: theme.muted }}>no climbs match filter</Mono>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 120, backgroundColor: theme.bg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}

      {tab !== 0 && (
        <PullToRefresh
          onRefresh={syncFromServer}
          contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
        >
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
      )}

      <Fab onPress={onLogSend} />

      <EditClimbSheet
        open={editClimb !== null}
        onClose={() => setEditClimb(null)}
        climb={editClimb}
      />

      <Modal visible={lightboxUri !== null} transparent animationType="fade" onRequestClose={() => setLightboxUri(null)}>
        <Pressable style={styles.lightboxBg} onPress={() => setLightboxUri(null)}>
          {lightboxUri && (
            <Image source={{ uri: lightboxUri }} style={styles.lightboxImg} resizeMode="contain" />
          )}
        </Pressable>
      </Modal>
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 8 },
  chipRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1 },
  chipSm: { paddingVertical: 4, paddingHorizontal: 10 },
  chipText: { fontSize: 10, letterSpacing: 1 },
  countLabel: { fontSize: 9, letterSpacing: 1.2, marginBottom: 8 },
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
  lightboxBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  lightboxImg: { width: '100%', height: '80%' },
});
