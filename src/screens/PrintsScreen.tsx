import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  Modal, StyleSheet, Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { PullToRefresh } from '../components/crt/PullToRefresh';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { BlockBar } from '../components/crt/BlockBar';
import { Fab } from '../components/crt/Fab';
import { STATUS } from '../theme/palettes';
import { fmtDay } from '../utils/format';
import type { PrintJob } from '../data/types';

const TABS = ['OVERVIEW', 'HISTORY'];
const MATERIALS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'Resin'];

function fmtTime(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function calcCosts(ptm: string, fg: string, cpkg: string, pw: string, er: string) {
  const elec = (parseFloat(ptm) / 60) * (parseFloat(pw) / 1000) * parseFloat(er);
  const fil = (parseFloat(fg) / 1000) * parseFloat(cpkg);
  return { elec: isNaN(elec) ? 0 : elec, fil: isNaN(fil) ? 0 : fil };
}

interface AddPrintModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: object) => void;
}

function AddPrintModal({ visible, onClose, onSave }: AddPrintModalProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [timeMin, setTimeMin] = useState('');
  const [filG, setFilG] = useState('');
  const [costPerKg, setCostPerKg] = useState('25');
  const [wattage, setWattage] = useState('200');
  const [elecRate, setElecRate] = useState('0.20');
  const [material, setMaterial] = useState('PLA');
  const [notes, setNotes] = useState('');

  const { elec, fil } = calcCosts(timeMin, filG, costPerKg, wattage, elecRate);
  const total = elec + fil;

  const canSave = name.trim().length > 0 && parseFloat(timeMin) > 0 && parseFloat(filG) >= 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      print_time_min: parseInt(timeMin),
      filament_used_g: parseFloat(filG),
      filament_cost_per_kg: parseFloat(costPerKg) || 25,
      printer_wattage: parseFloat(wattage) || 200,
      electricity_rate: parseFloat(elecRate) || 0.20,
      material,
      notes: notes.trim() || undefined,
    });
    setName(''); setTimeMin(''); setFilG('');
    setCostPerKg('25'); setWattage('200'); setElecRate('0.20');
    setMaterial('PLA'); setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={[styles.sheetTitle, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
            // LOG 3D PRINT
          </Text>

          {/* Cost preview */}
          <View style={[styles.costPreview, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Text style={[styles.costLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// COST PREVIEW</Text>
            <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
              <Text style={[styles.costItem, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                elec ${elec.toFixed(3)}
              </Text>
              <Text style={[styles.costItem, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                fil ${fil.toFixed(3)}
              </Text>
              <Text style={[styles.costItem, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                total ${total.toFixed(2)}
              </Text>
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>OBJECT NAME</Text>
          <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
            value={name} onChangeText={setName} placeholder="e.g. Raspberry Pi case"
            placeholderTextColor={theme.muted} autoFocus />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>PRINT TIME (min)</Text>
              <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
                value={timeMin} onChangeText={setTimeMin} keyboardType="numeric"
                placeholder="180" placeholderTextColor={theme.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>FILAMENT (g)</Text>
              <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
                value={filG} onChangeText={setFilG} keyboardType="numeric"
                placeholder="45" placeholderTextColor={theme.muted} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>FILAMENT $/kg</Text>
              <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
                value={costPerKg} onChangeText={setCostPerKg} keyboardType="numeric"
                placeholder="25" placeholderTextColor={theme.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>PRINTER (W)</Text>
              <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
                value={wattage} onChangeText={setWattage} keyboardType="numeric"
                placeholder="200" placeholderTextColor={theme.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>$/kWh</Text>
              <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
                value={elecRate} onChangeText={setElecRate} keyboardType="numeric"
                placeholder="0.20" placeholderTextColor={theme.muted} />
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>MATERIAL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {MATERIALS.map(m => (
                <Pressable key={m} onPress={() => setMaterial(m)}
                  style={[styles.chip, {
                    backgroundColor: material === m ? theme.accent : theme.surface,
                    borderColor: material === m ? theme.accent : theme.border,
                  }]}>
                  <Text style={[styles.chipText, { color: material === m ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={[styles.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>NOTES (optional)</Text>
          <TextInput style={[styles.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
            value={notes} onChangeText={setNotes} placeholder="e.g. 0.2mm layer, needs supports"
            placeholderTextColor={theme.muted} />

          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: canSave ? theme.accent : theme.surface, borderColor: theme.accent }]}>
            <Text style={[styles.saveBtnText, { color: canSave ? theme.bg : theme.muted, fontFamily: FONTS.jetbrains }]}>
              [+] LOG PRINT
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

interface Props { onLogPrint: () => void; }

export function PrintsScreen({ onLogPrint }: Props) {
  const theme = useTheme();
  const prints = useStore(s => s.data.prints);
  const syncFromServer = useStore(s => s.syncFromServer);
  const section = useStore(s => s.section);
  const addPrint = useStore(s => s.addPrint);
  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  React.useEffect(() => { if (section !== 'prints') setTab(0); }, [section]);

  const stats = prints?.stats ?? null;
  const jobs: PrintJob[] = Array.isArray(prints?.jobs) ? prints.jobs : [];

  return (
    <CRTScreen title="3D PRINTS">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />
      <PullToRefresh
        onRefresh={syncFromServer}
        contentContainerStyle={[styles.content, { backgroundColor: theme.bg }]}
      >
        {tab === 0 && (
          <>
            {/* Stats hero */}
            <Box title="// OVERVIEW">
              {stats && stats.total_prints > 0 ? (
                <View style={styles.statsGrid}>
                  {[
                    { label: 'TOTAL', val: String(stats.total_prints) },
                    { label: 'SUCCESS', val: `${stats.success_rate}%` },
                    { label: 'FILAMENT', val: `${stats.total_filament_g}g` },
                    { label: 'COST', val: `$${stats.total_cost.toFixed(2)}` },
                    { label: 'TIME', val: fmtTime(stats.total_print_time_min) },
                    { label: 'FAILED', val: String(stats.failed_prints) },
                  ].map(r => (
                    <View key={r.label} style={styles.statCell}>
                      <Comment>{`// ${r.label}`}</Comment>
                      <Text style={[styles.statVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                        {r.val}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Mono style={{ color: theme.muted }}>no prints logged yet</Mono>
              )}
              {stats && stats.by_material && Object.keys(stats.by_material).length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Comment>{'// by material'}</Comment>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {Object.entries(stats.by_material).map(([mat, cnt]) => (
                      <Text key={mat} style={[styles.matChip, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                        {mat} · {cnt}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </Box>

            {/* Recent prints */}
            {jobs.length > 0 && (
              <Box title={`// RECENT (${Math.min(jobs.length, 5)} of ${jobs.length})`}>
                {jobs.slice(0, 5).map(job => (
                  <View key={job.id} style={[styles.jobRow, { borderBottomColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.jobName, { color: job.status === 'failed' ? STATUS.red : theme.cream, fontFamily: FONTS.jetbrains }]}>
                        {job.name}
                      </Text>
                      <Text style={[styles.jobMeta, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                        {job.material} · {fmtTime(job.print_time_min)} · {fmtDay(job.date)}
                      </Text>
                    </View>
                    <Text style={[styles.jobCost, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                      ${job.total_cost.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </Box>
            )}
          </>
        )}

        {tab === 1 && (
          <Box title={`// ALL PRINTS · ${jobs.length}`}>
            {jobs.length === 0 ? (
              <Mono style={{ color: theme.muted }}>no prints yet</Mono>
            ) : (
              jobs.map(job => {
                const statusColor = job.status === 'success' ? theme.accent
                  : job.status === 'failed' ? STATUS.red : STATUS.amber;
                return (
                  <View key={job.id} style={[styles.jobRow, { borderBottomColor: theme.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.jobName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>
                        {job.name}
                      </Text>
                      <Text style={[styles.jobMeta, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                        {job.material} · {job.filament_used_g}g · {fmtTime(job.print_time_min)}
                      </Text>
                      <Text style={[styles.jobMeta, { color: statusColor, fontFamily: FONTS.jetbrains }]}>
                        {job.status.replace('_', ' ')} · {fmtDay(job.date)}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
                        <Text style={[styles.costDetail, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                          elec ${job.electricity_cost.toFixed(3)}
                        </Text>
                        <Text style={[styles.costDetail, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                          fil ${job.filament_cost.toFixed(3)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.jobCost, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                      ${job.total_cost.toFixed(2)}
                    </Text>
                  </View>
                );
              })
            )}
          </Box>
        )}
      </PullToRefresh>

      <Fab onPress={() => setModalOpen(true)} />

      <AddPrintModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data) => addPrint(data as Parameters<typeof addPrint>[0])}
      />
    </CRTScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 100 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCell: { minWidth: 80 },
  statVal: { fontSize: 18, marginTop: 2 },
  matChip: { fontSize: 10, letterSpacing: 0.8 },
  jobRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10,
    borderBottomWidth: 1, gap: 8 },
  jobName: { fontSize: 12, letterSpacing: 0.5 },
  jobMeta: { fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  costDetail: { fontSize: 9 },
  jobCost: { fontSize: 13, letterSpacing: 0.5, paddingTop: 2 },
  // Modal
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, maxHeight: '85%' },
  sheetTitle: { fontSize: 10, letterSpacing: 1.4, marginBottom: 16 },
  costPreview: { padding: 10, borderWidth: 1, marginBottom: 14, gap: 4 },
  costLabel: { fontSize: 9, letterSpacing: 1.2, marginBottom: 4 },
  costItem: { fontSize: 11, letterSpacing: 0.5 },
  fieldLabel: { fontSize: 9, letterSpacing: 1.2, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, padding: 10, fontSize: 12, marginBottom: 2 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1 },
  chipText: { fontSize: 10, letterSpacing: 0.8 },
  saveBtn: { marginTop: 20, padding: 14, borderWidth: 1, alignItems: 'center' },
  saveBtnText: { fontSize: 12, letterSpacing: 1.2, fontWeight: '700' },
});
