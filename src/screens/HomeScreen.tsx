import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore, spendTotals, climbStats } from '../state/store';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Mono, Comment } from '../components/crt/Box';
import { Bars } from '../components/crt/charts/Bars';
import { fmtClock, greetPart, fmtMoney } from '../utils/format';

export function HomeScreen() {
  const theme = useTheme();
  const auth = useStore(s => s.auth);
  const data = useStore(s => s.data);
  const homeMode = useStore(s => s.homeMode);
  const setHomeMode = useStore(s => s.setHomeMode);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const totals = spendTotals(data.spending);
  const stats = climbStats(data.climbing);
  const totalIncome   = (data.spending.income ?? []).reduce((s, i) => s + i.amt, 0);
  const totalExpenses = data.spending.txns.reduce((s, e) => s + e.amt, 0);
  const balance       = totalIncome - totalExpenses;
  const fitness = data.fitness;
  const jobs = data.jobs;

  const jobCount = Object.values(jobs.board).reduce((s, col) => s + col.length, 0);
  const activeJobCount = (jobs.board.screening?.length ?? 0) + (jobs.board.interview?.length ?? 0);

  return (
    <CRTScreen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Mono style={[styles.clock, { color: theme.muted }]}>{fmtClock(now)}</Mono>
          <Text style={[styles.greet, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
            {`good ${greetPart(now)}, ${auth?.name ?? 'user'}_`}
          </Text>
          <Comment>{'// system nominal'}</Comment>
        </View>

        <View style={styles.modeTabs}>
          {(['dash','brief','grid'] as const).map(m => (
            <Pressable
              key={m}
              onPress={() => setHomeMode(m)}
              style={[styles.modeTab, {
                backgroundColor: homeMode === m ? theme.accent : theme.surface,
                borderColor: homeMode === m ? theme.accent : theme.border,
              }]}
            >
              <Text style={[styles.modeTabText, { color: homeMode === m ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                {m.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {homeMode === 'dash' && (
          <>
            <Box title="SPENDING">
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// balance'}</Comment>
                  <Text style={[styles.bigNum, { color: balance >= 0 ? '#3aff7a' : '#ff6a5a', fontFamily: FONTS.jetbrains }]}>
                    {balance >= 0 ? '+' : ''}{fmtMoney(balance)}
                  </Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// this month'}</Comment>
                  <Text style={[styles.bigNum, { color: totals.left < 0 ? '#ff6a5a' : theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {fmtMoney(totals.monthTotal)}
                  </Text>
                  <Mono style={[styles.small, { color: theme.muted }]}>{`of ${fmtMoney(totals.budget)}`}</Mono>
                </View>
              </View>
              <Bars values={data.spending.cats.map(c => c.spent)} height={56} labels={data.spending.cats.map(c => c.name)} showAllLabels />
            </Box>

            <Box title="FITNESS">
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// streak'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {`${fitness.streak}d`}
                  </Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// weight'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {`${fitness.weight}kg`}
                  </Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// sessions'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {fitness.workouts.length}
                  </Text>
                </View>
              </View>
              <Bars values={fitness.weekSessions} height={40} />
            </Box>

            <Box title="JOBS">
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// applied'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{jobCount}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// active'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{activeJobCount}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// offers'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {jobs.board.offer?.length ?? 0}
                  </Text>
                </View>
              </View>
            </Box>

            <Box title="CLIMBING">
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// sends'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{stats.sent}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// max'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{stats.max}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// flashes'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{stats.flashes}</Text>
                </View>
              </View>
            </Box>
          </>
        )}

        {homeMode === 'brief' && (
          <Box title="SYSTEM BRIEF">
            {[
              `balance ${balance >= 0 ? '+' : ''}${fmtMoney(balance)}  (${fmtMoney(totals.monthTotal)} this month)`,
              `fitness ${fitness.streak}d streak · ${fitness.weight}kg`,
              `jobs    ${jobCount} apps · ${activeJobCount} active`,
              `climbing ${stats.sent} sends · max ${stats.max}`,
              `projects ${data.projects.repos.filter(r => r.active).length} active repos`,
              `hydro   ${data.hydro.tanks.length} tanks`,
            ].map((line, i) => (
              <Mono key={i} style={{ color: i === 0 ? theme.cream : theme.accentDim }}>{line}</Mono>
            ))}
          </Box>
        )}

        {homeMode === 'grid' && (
          <View style={styles.grid}>
            {[
              { label: 'BALANCE', val: `${balance >= 0 ? '+' : ''}${fmtMoney(balance)}` },
              { label: 'STREAK', val: `${fitness.streak}d` },
              { label: 'WEIGHT', val: `${fitness.weight}kg` },
              { label: 'SENDS', val: `${stats.sent}` },
              { label: 'MAX GRADE', val: stats.max },
              { label: 'JOBS', val: `${jobCount}` },
              { label: 'ACTIVE', val: `${activeJobCount}` },
              { label: 'OFFERS', val: `${jobs.board.offer?.length ?? 0}` },
            ].map(item => (
              <View key={item.label} style={[styles.gridCell, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Comment>{`// ${item.label}`}</Comment>
                <Text style={[styles.gridVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{item.val}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  header: { gap: 4, paddingVertical: 8 },
  clock: { fontSize: 10, letterSpacing: 1.4 },
  greet: { fontSize: 22, marginTop: 2 },
  modeTabs: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  modeTab: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12 },
  modeTabText: { fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statBlock: { flex: 1, gap: 2 },
  bigNum: { fontSize: 22, lineHeight: 26 },
  small: { fontSize: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCell: { width: '47%', borderWidth: 1, padding: 12, gap: 4 },
  gridVal: { fontSize: 20 },
});
