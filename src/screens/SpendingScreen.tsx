import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore, spendTotals } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { BlockBar } from '../components/crt/BlockBar';
import { Bars } from '../components/crt/charts/Bars';
import { Fab } from '../components/crt/Fab';
import { fmtMoney, fmtTxnDate } from '../utils/format';
import { EditExpenseSheet } from './sheets/EditExpenseSheet';
import type { Expense } from '../data/types';

const TABS = ['OVERVIEW', 'TRANSACTIONS', 'CATEGORIES'];

interface Props { onAddExpense: () => void; }

export function SpendingScreen({ onAddExpense }: Props) {
  const theme = useTheme();
  const data = useStore(s => s.data);
  const syncFromServer = useStore(s => s.syncFromServer);
  const section = useStore(s => s.section);
  const [tab, setTab] = useState(0);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const totals = spendTotals(data.spending);

  useEffect(() => { if (section !== 'spending') setTab(0); }, [section]);

  return (
    <CRTScreen title="SPENDING">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && (
          <>
            <Box title="MONTHLY BUDGET">
              <View style={styles.row}>
                <View style={styles.statBlock}>
                  <Comment>{'// spent'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{fmtMoney(totals.monthTotal)}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// budget'}</Comment>
                  <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{fmtMoney(totals.budget)}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Comment>{'// left'}</Comment>
                  <Text style={[styles.bigNum, { color: totals.left < 0 ? '#ff6a5a' : theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {fmtMoney(totals.left)}
                  </Text>
                </View>
              </View>
              <BlockBar pct={totals.pct} />
            </Box>
            <Box title="SPEND BY CATEGORY">
              <Bars values={data.spending.cats.map(c => c.spent)} height={80} labels={data.spending.cats.map(c => c.name)} showAllLabels />
            </Box>
            <Box title="TOP CATEGORIES">
              {[...data.spending.cats].sort((a, b) => b.spent - a.spent).slice(0, 5).map(cat => (
                <View key={cat.name} style={styles.catRow}>
                  <Text style={[styles.catName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{cat.name}</Text>
                  <View style={styles.catRight}>
                    <Text style={[styles.catAmt, { color: cat.spent > cat.budget ? '#ff6a5a' : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                      {fmtMoney(cat.spent)}
                    </Text>
                    <BlockBar pct={cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0} />
                  </View>
                </View>
              ))}
            </Box>
          </>
        )}

        {tab === 1 && (
          <Box title={`TRANSACTIONS (${data.spending.txns.length})`}>
            {data.spending.txns.slice(0, 60).map(txn => (
              <Pressable key={txn.id} onPress={() => setEditExpense(txn)} style={[styles.txnRow, { borderBottomColor: theme.border }]}>
                <View style={styles.txnLeft}>
                  <Text style={[styles.txnMerchant, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{txn.merchant}</Text>
                  <Text style={[styles.txnMeta, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                    {txn.cat} · {fmtTxnDate(txn.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.txnAmt, { color: txn.over ? '#ff6a5a' : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                  {fmtMoney(txn.amt)}
                </Text>
              </Pressable>
            ))}
          </Box>
        )}

        {tab === 2 && (
          <Box title="CATEGORIES">
            {data.spending.cats.map(cat => (
              <View key={cat.name} style={[styles.catDetailRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.catName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{cat.name}</Text>
                <View style={styles.catDetailRight}>
                  <View style={styles.catDetailNums}>
                    <Text style={[styles.catAmt, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{fmtMoney(cat.spent)}</Text>
                    <Text style={[styles.catBudget, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{` / ${fmtMoney(cat.budget)}`}</Text>
                  </View>
                  <BlockBar pct={cat.budget > 0 ? Math.round((cat.spent / cat.budget) * 100) : 0} />
                </View>
              </View>
            ))}
          </Box>
        )}
      </PullToRefresh>
      <Fab onPress={onAddExpense} />
      <EditExpenseSheet open={editExpense !== null} onClose={() => setEditExpense(null)} expense={editExpense} />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statBlock: { flex: 1, gap: 2 },
  bigNum: { fontSize: 20, lineHeight: 24 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  catName: { width: 90, fontSize: 11 },
  catRight: { flex: 1, gap: 4 },
  catAmt: { fontSize: 12 },
  catDetailRow: { paddingVertical: 10, borderBottomWidth: 1, gap: 6 },
  catDetailRight: { gap: 4 },
  catDetailNums: { flexDirection: 'row', alignItems: 'baseline' },
  catBudget: { fontSize: 11 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  txnLeft: { flex: 1, gap: 2 },
  txnMerchant: { fontSize: 13 },
  txnMeta: { fontSize: 10 },
  txnAmt: { fontSize: 14 },
});
