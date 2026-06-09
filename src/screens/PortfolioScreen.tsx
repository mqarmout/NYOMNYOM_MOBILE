import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import type { PortfolioItem } from '../data/types';

const TABS = ['PROJECTS', 'ABOUT'];

const STATUS_COLOR: Record<PortfolioItem['status'], string> = {
  live:     '#3aff7a',
  wip:      '#ffc55a',
  archived: '#7a7a7a',
};

export function PortfolioScreen() {
  const theme = useTheme();
  const data = useStore(s => s.data);
  const syncFromServer = useStore(s => s.syncFromServer);
  const [tab, setTab] = useState(0);

  return (
    <CRTScreen title="PORTFOLIO">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && (
          <>
            <Box title={`PROJECTS (${data.portfolio.items.length})`}>
              {data.portfolio.items.map(item => (
                <View key={item.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
                    <Text style={[styles.title, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{item.title}</Text>
                    <Text style={[styles.year, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{item.year}</Text>
                  </View>
                  <Text style={[styles.kind, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{item.kind}</Text>
                  <Text style={[styles.desc, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{item.desc}</Text>
                  <Text style={[styles.statusTag, { color: STATUS_COLOR[item.status], fontFamily: FONTS.jetbrains }]}>
                    {`[${item.status.toUpperCase()}]`}
                  </Text>
                </View>
              ))}
            </Box>
          </>
        )}

        {tab === 1 && (
          <Box title="ABOUT">
            <View style={styles.profileRow}>
              <Text style={[styles.profileName, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                {data.user.name || data.user.handle}
              </Text>
              {!!data.user.handle && <Mono style={{ color: theme.muted }}>@{data.user.handle}</Mono>}
            </View>
            {!!data.user.role && <Text style={[styles.role, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{data.user.role}</Text>}
            {!!data.user.loc && <Text style={[styles.loc, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{data.user.loc}</Text>}
            {!!data.user.bio && <Text style={[styles.bio, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{data.user.bio}</Text>}
            {!!data.user.github && <Mono style={{ color: theme.accentDim, fontSize: 11 }}>{data.user.github}</Mono>}
            {!!data.user.website && <Mono style={{ color: theme.accentDim, fontSize: 11 }}>{data.user.website}</Mono>}
          </Box>
        )}
      </PullToRefresh>
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  card: { borderWidth: 1, padding: 12, marginBottom: 8, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  title: { flex: 1, fontSize: 14 },
  year: { fontSize: 10 },
  kind: { fontSize: 10, letterSpacing: 1 },
  desc: { fontSize: 12, lineHeight: 18 },
  statusTag: { fontSize: 10, letterSpacing: 0.8, marginTop: 4 },
  profileRow: { gap: 4, marginBottom: 10 },
  profileName: { fontSize: 22 },
  role: { fontSize: 14, marginBottom: 4 },
  loc: { fontSize: 12 },
  bio: { fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 4 },
});
