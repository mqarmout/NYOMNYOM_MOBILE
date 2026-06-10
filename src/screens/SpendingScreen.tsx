import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ScrollView, Modal, KeyboardAvoidingView, RefreshControl, StyleSheet } from 'react-native';
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
import { EditIncomeSheet } from './sheets/EditIncomeSheet';
import type { Expense, IncomeEntry } from '../data/types';

const TABS = ['OVERVIEW', 'LEDGER', 'CATEGORIES'];

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';
type KindFilter = 'all' | 'expense' | 'income';

interface LedgerItem {
  id: string;
  createdAt: string;
  label: string;
  sub: string;
  amt: number;
  kind: 'expense' | 'income';
  over?: boolean;
  raw?: Expense;
  rawIncome?: IncomeEntry;
}

interface FilterState {
  kind: KindFilter;
  cat: string;
  merchant: string;
  sort: SortKey;
}

const DEFAULT_FILTER: FilterState = { kind: 'all', cat: 'all', merchant: '', sort: 'newest' };

interface Props { onAddExpense: () => void; }

export function SpendingScreen({ onAddExpense }: Props) {
  const theme = useTheme();
  const data = useStore(s => s.data);
  const syncFromServer = useStore(s => s.syncFromServer);
  const section = useStore(s => s.section);
  const [tab, setTab] = useState(0);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editIncome, setEditIncome] = useState<IncomeEntry | null>(null);
  const [filterModal, setFilterModal] = useState(false);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [draft, setDraft] = useState<FilterState>(DEFAULT_FILTER);
  const [refreshing, setRefreshing] = useState(false);
  const totals = spendTotals(data.spending);

  const totalIncome   = useMemo(() => (data.spending.income ?? []).reduce((s, i) => s + i.amt, 0), [data.spending.income]);
  const totalExpenses = useMemo(() => data.spending.txns.reduce((s, e) => s + e.amt, 0), [data.spending.txns]);
  const balance       = totalIncome - totalExpenses;

  useEffect(() => { if (section !== 'spending') setTab(0); }, [section]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncFromServer().catch(() => {});
    setRefreshing(false);
  }, [syncFromServer]);

  const openFilter = useCallback(() => { setDraft(filter); setFilterModal(true); }, [filter]);
  const applyFilter = useCallback(() => { setFilter(draft); setFilterModal(false); }, [draft]);
  const clearFilter = useCallback(() => { setDraft(DEFAULT_FILTER); setFilter(DEFAULT_FILTER); setFilterModal(false); }, []);

  const isFiltered = filter.kind !== 'all' || filter.cat !== 'all' || filter.merchant !== '' || filter.sort !== 'newest';

  // Build unified ledger
  const allItems = useMemo((): LedgerItem[] => {
    const expenses: LedgerItem[] = data.spending.txns.map(e => ({
      id: `e_${e.id}`,
      createdAt: e.createdAt,
      label: e.merchant,
      sub: e.cat,
      amt: e.amt,
      kind: 'expense',
      over: e.over,
      raw: e,
    }));
    const income: LedgerItem[] = (data.spending.income ?? []).map(i => ({
      id: `i_${i.id}`,
      createdAt: i.createdAt,
      label: i.description,
      sub: i.source,
      amt: i.amt,
      kind: 'income',
      rawIncome: i,
    }));
    return [...expenses, ...income];
  }, [data.spending.txns, data.spending.income]);

  const displayed = useMemo(() => {
    let list = [...allItems];
    if (filter.kind !== 'all') list = list.filter(t => t.kind === filter.kind);
    if (filter.cat !== 'all') list = list.filter(t => t.sub === filter.cat);
    if (filter.merchant.trim()) {
      const q = filter.merchant.trim().toLowerCase();
      list = list.filter(t => t.label.toLowerCase().includes(q));
    }
    switch (filter.sort) {
      case 'oldest':  list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break;
      case 'highest': list.sort((a, b) => b.amt - a.amt); break;
      case 'lowest':  list.sort((a, b) => a.amt - b.amt); break;
      default:        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    }
    return list;
  }, [allItems, filter]);

  const renderItem = useCallback(({ item }: { item: LedgerItem }) => (
    <Pressable
      onPress={() => {
        if (item.kind === 'expense' && item.raw) setEditExpense(item.raw);
        else if (item.kind === 'income' && item.rawIncome) setEditIncome(item.rawIncome);
      }}
      style={[styles.txnRow, { borderBottomColor: theme.border }]}
    >
      <View style={[styles.kindDot, { backgroundColor: item.kind === 'income' ? '#3aff7a' : theme.accentDim }]} />
      <View style={styles.txnLeft}>
        <Text style={[styles.txnMerchant, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{item.label}</Text>
        <Text style={[styles.txnMeta, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
          {item.sub} · {fmtTxnDate(item.createdAt)}
        </Text>
      </View>
      <Text style={[styles.txnAmt, {
        color: item.kind === 'income' ? '#3aff7a' : item.over ? '#ff6a5a' : theme.accentDim,
        fontFamily: FONTS.jetbrains,
      }]}>
        {item.kind === 'income' ? '+' : ''}{fmtMoney(item.amt)}
      </Text>
    </Pressable>
  ), [theme]);

  const ledgerHeader = (
    <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={[styles.countLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
        {`// ${displayed.length} of ${allItems.length}`}
      </Text>
      <Pressable onPress={openFilter}
        style={[styles.filterBtn, { borderColor: isFiltered ? theme.accent : theme.border, backgroundColor: isFiltered ? theme.surface : 'transparent' }]}>
        <Text style={[styles.filterBtnText, { color: isFiltered ? theme.accent : theme.muted, fontFamily: FONTS.jetbrains }]}>
          {isFiltered ? '[FILTER ✓]' : '[FILTER]'}
        </Text>
      </Pressable>
    </View>
  );

  const cats = data.spending.cats;

  return (
    <CRTScreen title="SPENDING">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />

      {tab === 1 && (
        <FlatList
          data={displayed}
          keyExtractor={t => t.id}
          renderItem={renderItem}
          ListHeaderComponent={ledgerHeader}
          ListEmptyComponent={
            <View style={{ padding: 14 }}>
              <Mono style={{ color: theme.muted }}>no entries match filter</Mono>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 120, backgroundColor: theme.bg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={5}
        />
      )}

      {tab !== 1 && (
        <PullToRefresh
          onRefresh={syncFromServer}
          contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
        >
          {tab === 0 && (
            <>
              <Box title="BALANCE">
                <Comment>{'// net (income − expenses)'}</Comment>
                <Text style={[styles.balanceNum, { color: balance >= 0 ? '#3aff7a' : '#ff6a5a', fontFamily: FONTS.jetbrains }]}>
                  {balance >= 0 ? '+' : ''}{fmtMoney(balance)}
                </Text>
                <View style={[styles.row, { marginTop: 14 }]}>
                  <View style={styles.statBlock}>
                    <Comment>{'// income'}</Comment>
                    <Text style={[styles.bigNum, { color: '#3aff7a', fontFamily: FONTS.jetbrains }]}>{fmtMoney(totalIncome)}</Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Comment>{'// expenses'}</Comment>
                    <Text style={[styles.bigNum, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{fmtMoney(totalExpenses)}</Text>
                  </View>
                </View>
              </Box>
              <Box title="THIS MONTH">
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
      )}

      <Fab onPress={onAddExpense} />
      <EditExpenseSheet open={editExpense !== null} onClose={() => setEditExpense(null)} expense={editExpense} />
      <EditIncomeSheet open={editIncome !== null} onClose={() => setEditIncome(null)} income={editIncome} />

      {/* Filter modal */}
      <Modal visible={filterModal} transparent animationType="slide" onRequestClose={() => setFilterModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Pressable style={mStyles.scrim} onPress={() => setFilterModal(false)} />
          <View style={[mStyles.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <Text style={[mStyles.title, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// FILTER LEDGER</Text>

            {/* Type */}
            <Text style={[mStyles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>TYPE</Text>
            <View style={mStyles.chipRow}>
              {(['all', 'expense', 'income'] as KindFilter[]).map(k => {
                const on = draft.kind === k;
                return (
                  <Pressable key={k} onPress={() => setDraft(d => ({ ...d, kind: k }))}
                    style={[mStyles.chip, { backgroundColor: on ? theme.accent : theme.surface, borderColor: on ? theme.accent : theme.border }]}>
                    <Text style={[mStyles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                      {k.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Category */}
            <Text style={[mStyles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={mStyles.chipRow}>
                {[{ name: 'all' }, ...cats].map(c => {
                  const on = draft.cat === c.name;
                  return (
                    <Pressable key={c.name} onPress={() => setDraft(d => ({ ...d, cat: c.name }))}
                      style={[mStyles.chip, { backgroundColor: on ? theme.accent : theme.surface, borderColor: on ? theme.accent : theme.border }]}>
                      <Text style={[mStyles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                        {c.name.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Merchant search */}
            <Text style={[mStyles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>MERCHANT / DESCRIPTION</Text>
            <TextInput
              style={[mStyles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
              value={draft.merchant}
              onChangeText={v => setDraft(d => ({ ...d, merchant: v }))}
              placeholder="search..."
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
            />

            {/* Sort */}
            <Text style={[mStyles.label, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>SORT BY</Text>
            <View style={mStyles.chipRow}>
              {(['newest', 'oldest', 'highest', 'lowest'] as SortKey[]).map(s => {
                const on = draft.sort === s;
                return (
                  <Pressable key={s} onPress={() => setDraft(d => ({ ...d, sort: s }))}
                    style={[mStyles.chip, { backgroundColor: on ? theme.accent : theme.surface, borderColor: on ? theme.accent : theme.border }]}>
                    <Text style={[mStyles.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                      {s.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              <Pressable onPress={clearFilter} style={[mStyles.btn, { flex: 1, borderColor: theme.border }]}>
                <Text style={[mStyles.btnText, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>CLEAR</Text>
              </Pressable>
              <Pressable onPress={applyFilter} style={[mStyles.btn, { flex: 2, backgroundColor: theme.accent, borderColor: theme.accent }]}>
                <Text style={[mStyles.btnText, { color: theme.bg, fontFamily: FONTS.jetbrains }]}>APPLY</Text>
              </Pressable>
            </View>
          </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  statBlock: { flex: 1, gap: 2 },
  balanceNum: { fontSize: 34, lineHeight: 40, marginTop: 6 },
  bigNum: { fontSize: 20, lineHeight: 24 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  catName: { width: 90, fontSize: 11 },
  catRight: { flex: 1, gap: 4 },
  catAmt: { fontSize: 12 },
  catDetailRow: { paddingVertical: 10, borderBottomWidth: 1, gap: 6 },
  catDetailRight: { gap: 4 },
  catDetailNums: { flexDirection: 'row', alignItems: 'baseline' },
  catBudget: { fontSize: 11 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, paddingHorizontal: 14, gap: 10 },
  kindDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2, flexShrink: 0 },
  txnLeft: { flex: 1, gap: 2 },
  txnMerchant: { fontSize: 13 },
  txnMeta: { fontSize: 10 },
  txnAmt: { fontSize: 14 },
  countLabel: { fontSize: 9, letterSpacing: 1.2 },
  filterBtn: { paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1 },
  filterBtnText: { fontSize: 10, letterSpacing: 1 },
});

const mStyles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { marginTop: 'auto', borderTopWidth: 1, maxHeight: '80%' },
  title: { fontSize: 10, letterSpacing: 1.4, marginBottom: 16 },
  label: { fontSize: 9, letterSpacing: 1.2, marginTop: 16, marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1 },
  chipText: { fontSize: 10, letterSpacing: 0.8 },
  input: { borderWidth: 1, padding: 10, fontSize: 13 },
  btn: { padding: 13, borderWidth: 1, alignItems: 'center' },
  btnText: { fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
});
