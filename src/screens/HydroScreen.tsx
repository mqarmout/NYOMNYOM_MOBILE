import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { BlockBar } from '../components/crt/BlockBar';
import { Fab } from '../components/crt/Fab';
import { fmtDay } from '../utils/format';
import { STATUS } from '../theme/palettes';

const TABS = ['TANKS', 'DOSING', 'PLANTS'];

interface Props { onLogDose: () => void; }

export function HydroScreen({ onLogDose }: Props) {
  const theme = useTheme();
  const hydro = useStore(s => s.data.hydro);
  const syncFromServer = useStore(s => s.syncFromServer);
  const section = useStore(s => s.section);
  const [tab, setTab] = useState(0);
  useEffect(() => { if (section !== 'hydro') setTab(0); }, [section]);

  return (
    <CRTScreen title="HYDRO">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && hydro.tanks.map(tank => (
          <Box key={tank.id} title={`${tank.name} [${tank.status.toUpperCase()}]`}>
            <View style={styles.readings}>
              {[
                { label: 'pH',   val: tank.ph.toFixed(1),   unit: '' },
                { label: 'EC',   val: tank.ec.toFixed(0),   unit: 'ppm' },
                { label: 'TEMP', val: tank.temp.toFixed(1), unit: '°C' },
                { label: 'H2O',  val: `${tank.water}%`,     unit: '' },
              ].map(r => (
                <View key={r.label} style={styles.reading}>
                  <Comment>{`// ${r.label}`}</Comment>
                  <Text style={[styles.readingVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                    {r.val}{r.unit && <Text style={[styles.readingUnit, { color: theme.muted }]}>{` ${r.unit}`}</Text>}
                  </Text>
                </View>
              ))}
            </View>
            <BlockBar pct={tank.water} />
            {tank.plants.length > 0 && (
              <View style={styles.plants}>
                <Comment>{'// plants'}</Comment>
                <Text style={[styles.plantList, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                  {tank.plants.join(' · ')}
                </Text>
              </View>
            )}
            {tank.status === 'alert' && (
              <Text style={[styles.alert, { color: STATUS.red, fontFamily: FONTS.jetbrains }]}>{'[!] check required'}</Text>
            )}
          </Box>
        ))}

        {tab === 1 && (
          <Box title={`DOSING LOG (${hydro.doses.length})`}>
            {hydro.doses.length === 0 && <Comment>{'// no doses logged'}</Comment>}
            {hydro.doses.map(dose => (
              <View key={dose.id} style={[styles.doseRow, { borderBottomColor: theme.border }]}>
                <View style={styles.doseLeft}>
                  <Text style={[styles.doseWhat, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{dose.what}</Text>
                  <Mono style={{ color: theme.muted, fontSize: 10 }}>{`${dose.tank} · ${fmtDay(dose.createdAt)}`}</Mono>
                </View>
                <Text style={[styles.doseAmt, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>{dose.amt}</Text>
              </View>
            ))}
          </Box>
        )}

        {tab === 2 && (
          <Box title="PLANTS">
            {hydro.tanks.flatMap(t => t.plants.map(p => ({ tank: t.name, plant: p }))).length === 0 && (
              <Comment>{'// no plants tracked'}</Comment>
            )}
            {hydro.tanks.flatMap(t => t.plants.map((p, i) => (
              <View key={`${t.id}-${i}`} style={[styles.plantRow, { borderBottomColor: theme.border }]}>
                <View style={[styles.plantDot, { backgroundColor: theme.accent }]} />
                <Text style={[styles.plantName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{p}</Text>
                <Text style={[styles.plantTank, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{t.name}</Text>
              </View>
            )))}
          </Box>
        )}
      </PullToRefresh>
      <Fab onPress={onLogDose} />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, paddingBottom: 120, gap: 12 },
  readings: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  reading: { width: '45%', gap: 2 },
  readingVal: { fontSize: 20 },
  readingUnit: { fontSize: 12 },
  plants: { marginTop: 8, gap: 4 },
  plantList: { fontSize: 12 },
  alert: { fontSize: 11, marginTop: 8, letterSpacing: 0.8 },
  doseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  doseLeft: { flex: 1, gap: 2 },
  doseWhat: { fontSize: 13 },
  doseAmt: { fontSize: 13 },
  plantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  plantDot: { width: 6, height: 6, borderRadius: 3 },
  plantName: { flex: 1, fontSize: 13 },
  plantTank: { fontSize: 11 },
});
