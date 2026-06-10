import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  Modal, KeyboardAvoidingView, FlatList, StyleSheet, RefreshControl,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { FONTS } from '../theme/type';
import { useStore } from '../state/store';
import { CRTScreen } from '../components/crt/CRTScreen';
import { Box, Comment, Mono } from '../components/crt/Box';
import { SubTabs } from '../components/crt/SubTabs';
import { Fab } from '../components/crt/Fab';
import { STATUS } from '../theme/palettes';
import { fmtDay } from '../utils/format';
import type { PrintJob, PrintProfile, PrintProject } from '../data/types';

const TABS = ['PROJECTS', 'PROFILES', 'STATS'];
const MATERIALS = ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'Resin'];

function fmtTime(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function calcCosts(ptm: string, fg: string, cpkg: string, pw: string, er: string, qty: string) {
  const rate = parseFloat(er);
  const q = Math.max(1, parseInt(qty) || 1);
  const base = isNaN(rate) ? 0 : rate;
  const elec = base + (parseFloat(ptm) / 60) * (parseFloat(pw) / 1000) * rate;
  const fil = (parseFloat(fg) / 1000) * parseFloat(cpkg);
  return {
    elec: isNaN(elec) ? 0 : elec * q,
    fil: isNaN(fil) ? 0 : fil * q,
    q,
  };
}

// ── Shared field helpers ───────────────────────────────────────────────────

function FieldLabel({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Text style={[s.fieldLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>{label}</Text>
  );
}

function Input({ value, onChange, placeholder, numeric }: {
  value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean;
}) {
  const theme = useTheme();
  return (
    <TextInput
      style={[s.input, { color: theme.cream, borderColor: theme.border, fontFamily: FONTS.jetbrains }]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.muted}
      keyboardType={numeric ? 'decimal-pad' : 'default'}
    />
  );
}

// ── Print form (used in Add + Edit modals) ─────────────────────────────────

interface PrintFormState {
  name: string; timeMin: string; filG: string;
  costPerKg: string; wattage: string; elecRate: string;
  material: string; notes: string; quantity: string;
}

const EMPTY_FORM: PrintFormState = {
  name: '', timeMin: '', filG: '',
  costPerKg: '25', wattage: '200', elecRate: '0.20',
  material: 'PLA', notes: '', quantity: '1',
};

function PrintForm({
  form, setForm, profiles, onSave, onDelete, saveLabel,
}: {
  form: PrintFormState;
  setForm: React.Dispatch<React.SetStateAction<PrintFormState>>;
  profiles: PrintProfile[];
  onSave: () => void;
  onDelete?: () => void;
  saveLabel: string;
}) {
  const theme = useTheme();
  const { elec, fil, q } = calcCosts(form.timeMin, form.filG, form.costPerKg, form.wattage, form.elecRate, form.quantity);
  const total = elec + fil;
  const canSave = form.name.trim().length > 0 && parseFloat(form.timeMin) > 0 && parseFloat(form.filG) >= 0;

  const loadProfile = (p: PrintProfile) => {
    setForm(f => ({
      ...f,
      material: p.material,
      costPerKg: String(p.filamentCostPerKg),
      wattage: String(p.printerWattage),
      elecRate: String(p.electricityRate),
    }));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Cost preview */}
      <View style={[s.costPreview, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <Text style={[s.costLabel, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
          {`// COST PREVIEW × ${q} (incl. 1kWh heatbed each)`}
        </Text>
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          <Text style={[s.costItem, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>elec ${elec.toFixed(3)}</Text>
          <Text style={[s.costItem, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>fil ${fil.toFixed(3)}</Text>
          <Text style={[s.costItem, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>total ${total.toFixed(2)}</Text>
        </View>
      </View>

      {profiles.length > 0 && (
        <>
          <FieldLabel label="LOAD FROM PROFILE" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {profiles.map(p => (
                <Pressable key={p.id} onPress={() => loadProfile(p)}
                  style={[s.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[s.chipText, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                    {p.name} ({p.material})
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <FieldLabel label="PRINT NAME" />
      <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="bracket, case, holder..." />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="PRINT TIME (min)" />
          <Input value={form.timeMin} onChange={v => setForm(f => ({ ...f, timeMin: v }))} placeholder="180" numeric />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="FILAMENT (g)" />
          <Input value={form.filG} onChange={v => setForm(f => ({ ...f, filG: v }))} placeholder="45" numeric />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="FILAMENT $/kg" />
          <Input value={form.costPerKg} onChange={v => setForm(f => ({ ...f, costPerKg: v }))} placeholder="25" numeric />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="PRINTER (W)" />
          <Input value={form.wattage} onChange={v => setForm(f => ({ ...f, wattage: v }))} placeholder="200" numeric />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="$/kWh" />
          <Input value={form.elecRate} onChange={v => setForm(f => ({ ...f, elecRate: v }))} placeholder="0.20" numeric />
        </View>
      </View>

      <FieldLabel label="MATERIAL" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {MATERIALS.map(m => {
            const on = form.material === m;
            return (
              <Pressable key={m} onPress={() => setForm(f => ({ ...f, material: m }))}
                style={[s.chip, { backgroundColor: on ? theme.accent : theme.surface, borderColor: on ? theme.accent : theme.border }]}>
                <Text style={[s.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>{m}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <FieldLabel label="QUANTITY (copies)" />
      <Input value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} placeholder="1" numeric />

      <FieldLabel label="NOTES (optional)" />
      <Input value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="layer height, supports..." />

      <Pressable onPress={canSave ? onSave : undefined}
        style={[s.saveBtn, { backgroundColor: canSave ? theme.accent : theme.surface, borderColor: theme.accent }]}>
        <Text style={[s.saveBtnText, { color: canSave ? theme.bg : theme.muted, fontFamily: FONTS.jetbrains }]}>
          {saveLabel}
        </Text>
      </Pressable>

      {onDelete && (
        <Pressable onPress={onDelete} style={[s.deleteBtn, { borderColor: STATUS.red }]}>
          <Text style={[s.deleteBtnText, { color: STATUS.red, fontFamily: FONTS.jetbrains }]}>DELETE PRINT</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ── Project Detail Modal ───────────────────────────────────────────────────

function ProjectDetailModal({ project, profiles, onClose }: {
  project: PrintProject;
  profiles: PrintProfile[];
  onClose: () => void;
}) {
  const theme = useTheme();
  const addPrintToProject = useStore(s => s.addPrintToProject);
  const updatePrint = useStore(s => s.updatePrint);
  const deletePrint = useStore(s => s.deletePrint);
  const deleteProject = useStore(s => s.deleteProject);

  const [addOpen, setAddOpen] = useState(false);
  const [editPrint, setEditPrint] = useState<PrintJob | null>(null);
  const [form, setForm] = useState<PrintFormState>(EMPTY_FORM);

  const openAdd = () => { setForm(EMPTY_FORM); setAddOpen(true); };
  const openEdit = (job: PrintJob) => {
    setEditPrint(job);
    setForm({
      name: job.name,
      timeMin: String(job.print_time_min),
      filG: String(job.filament_used_g),
      costPerKg: String(job.filament_cost_per_kg),
      wattage: String(job.printer_wattage),
      elecRate: String(job.electricity_rate),
      material: job.material,
      notes: job.notes ?? '',
      quantity: String(job.quantity ?? 1),
    });
  };

  const handleAdd = async () => {
    await addPrintToProject(project.id, {
      name: form.name.trim(),
      print_time_min: parseInt(form.timeMin),
      filament_used_g: parseFloat(form.filG),
      filament_cost_per_kg: parseFloat(form.costPerKg) || 25,
      printer_wattage: parseFloat(form.wattage) || 200,
      electricity_rate: parseFloat(form.elecRate) || 0.20,
      material: form.material,
      quantity: Math.max(1, parseInt(form.quantity) || 1),
      notes: form.notes.trim() || undefined,
    });
    setAddOpen(false);
  };

  const handleUpdate = async () => {
    if (!editPrint) return;
    await updatePrint(editPrint.id, {
      name: form.name.trim(),
      print_time_min: parseInt(form.timeMin),
      filament_used_g: parseFloat(form.filG),
      filament_cost_per_kg: parseFloat(form.costPerKg) || 25,
      printer_wattage: parseFloat(form.wattage) || 200,
      electricity_rate: parseFloat(form.elecRate) || 0.20,
      material: form.material,
      quantity: Math.max(1, parseInt(form.quantity) || 1),
      notes: form.notes.trim() || undefined,
    });
    setEditPrint(null);
  };

  const handleDeletePrint = async () => {
    if (!editPrint) return;
    await deletePrint(editPrint.id);
    setEditPrint(null);
  };

  const handleDeleteProject = async () => {
    await deleteProject(project.id);
    onClose();
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={[s.fullModal, { backgroundColor: theme.bg }]}>
        {/* Header */}
        <View style={[s.detailHeader, { borderBottomColor: theme.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.detailTitle, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{project.name}</Text>
            <Text style={[s.detailMeta, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
              {`${project.prints.length} prints · ${fmtTime(project.totalTime)} · $${project.totalCost.toFixed(2)}`}
            </Text>
          </View>
          <Pressable onPress={onClose} style={[s.closeBtn, { borderColor: theme.border }]}>
            <Text style={[s.closeBtnText, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>✕</Text>
          </Pressable>
        </View>

        {/* Print list */}
        <FlatList
          data={project.prints}
          keyExtractor={j => String(j.id)}
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          ListEmptyComponent={
            <Mono style={{ color: theme.muted, marginTop: 20 }}>no prints yet — tap [+ ADD PRINT]</Mono>
          }
          renderItem={({ item }) => {
            const sc = item.status === 'success' ? theme.accent
              : item.status === 'failed' ? STATUS.red : STATUS.amber;
            return (
              <Pressable onPress={() => openEdit(item)}
                style={[s.jobRow, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.jobName, { color: theme.cream, fontFamily: FONTS.jetbrains }]}>{item.name}</Text>
                    {(item.quantity ?? 1) > 1 && (
                      <Text style={[s.qtyBadge, { color: theme.accent, borderColor: theme.accent, fontFamily: FONTS.jetbrains }]}>
                        ×{item.quantity}
                      </Text>
                    )}
                  </View>
                  <Text style={[s.jobMeta, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                    {item.material} · {item.filament_used_g}g · {fmtTime(item.print_time_min)}
                    {(item.quantity ?? 1) > 1 ? ` (×${item.quantity} = ${item.filament_used_g * (item.quantity ?? 1)}g, ${fmtTime(item.print_time_min * (item.quantity ?? 1))})` : ''}
                  </Text>
                  <Text style={[s.jobMeta, { color: sc, fontFamily: FONTS.jetbrains }]}>
                    {item.status.replace('_', ' ')} · {fmtDay(item.date)}
                  </Text>
                </View>
                <Text style={[s.jobCost, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                  ${(item.total_cost * (item.quantity ?? 1)).toFixed(2)}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Action row */}
        <View style={[s.detailActions, { borderTopColor: theme.border, backgroundColor: theme.bg }]}>
          <Pressable onPress={openAdd}
            style={[s.addPrintBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
            <Text style={[s.addPrintBtnText, { color: theme.bg, fontFamily: FONTS.jetbrains }]}>[+ ADD PRINT]</Text>
          </Pressable>
          <Pressable onPress={handleDeleteProject}
            style={[s.addPrintBtn, { borderColor: STATUS.red }]}>
            <Text style={[s.addPrintBtnText, { color: STATUS.red, fontFamily: FONTS.jetbrains }]}>DELETE PROJECT</Text>
          </Pressable>
        </View>

        {/* Add print sheet */}
        <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Pressable style={s.scrim} onPress={() => setAddOpen(false)} />
            <View style={[s.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
              <Text style={[s.sheetTitle, { color: theme.muted, fontFamily: FONTS.jetbrains, padding: 16, paddingBottom: 0 }]}>
                // ADD PRINT TO {project.name.toUpperCase()}
              </Text>
              <PrintForm form={form} setForm={setForm} profiles={profiles} onSave={handleAdd} saveLabel="[+] LOG PRINT" />
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Edit print sheet */}
        <Modal visible={editPrint !== null} transparent animationType="slide" onRequestClose={() => setEditPrint(null)}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <Pressable style={s.scrim} onPress={() => setEditPrint(null)} />
            <View style={[s.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
              <Text style={[s.sheetTitle, { color: theme.muted, fontFamily: FONTS.jetbrains, padding: 16, paddingBottom: 0 }]}>
                // EDIT PRINT
              </Text>
              <PrintForm form={form} setForm={setForm} profiles={profiles} onSave={handleUpdate} onDelete={handleDeletePrint} saveLabel="SAVE CHANGES" />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal>
  );
}

// ── Profile form modal ─────────────────────────────────────────────────────

function ProfileModal({ profile, onClose }: {
  profile?: PrintProfile;
  onClose: () => void;
}) {
  const theme = useTheme();
  const createProfile = useStore(s => s.createProfile);
  const updateProfile = useStore(s => s.updateProfile);
  const deleteProfile = useStore(s => s.deleteProfile);

  const [name, setName] = useState(profile?.name ?? '');
  const [material, setMaterial] = useState(profile?.material ?? 'PLA');
  const [cpkg, setCpkg] = useState(String(profile?.filamentCostPerKg ?? 25));
  const [wattage, setWattage] = useState(String(profile?.printerWattage ?? 200));
  const [elecRate, setElecRate] = useState(String(profile?.electricityRate ?? 0.20));

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    const data = {
      name: name.trim(), material,
      filament_cost_per_kg: parseFloat(cpkg) || 25,
      printer_wattage: parseFloat(wattage) || 200,
      electricity_rate: parseFloat(elecRate) || 0.20,
    };
    if (profile) await updateProfile(profile.id, data);
    else await createProfile(data);
    onClose();
  };

  const handleDelete = async () => {
    if (profile) await deleteProfile(profile.id);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Pressable style={s.scrim} onPress={onClose} />
        <View style={[s.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent }]}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={[s.sheetTitle, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
            {profile ? '// EDIT PROFILE' : '// NEW PROFILE'}
          </Text>

          <FieldLabel label="PROFILE NAME" />
          <Input value={name} onChange={setName} placeholder="Ender 3 PLA, Bambu PETG..." />

          <FieldLabel label="MATERIAL" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {MATERIALS.map(m => {
                const on = material === m;
                return (
                  <Pressable key={m} onPress={() => setMaterial(m)}
                    style={[s.chip, { backgroundColor: on ? theme.accent : theme.surface, borderColor: on ? theme.accent : theme.border }]}>
                    <Text style={[s.chipText, { color: on ? theme.bg : theme.accentDim, fontFamily: FONTS.jetbrains }]}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <FieldLabel label="FILAMENT $/kg" />
              <Input value={cpkg} onChange={setCpkg} placeholder="25" numeric />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel label="PRINTER (W)" />
              <Input value={wattage} onChange={setWattage} placeholder="200" numeric />
            </View>
            <View style={{ flex: 1 }}>
              <FieldLabel label="$/kWh" />
              <Input value={elecRate} onChange={setElecRate} placeholder="0.20" numeric />
            </View>
          </View>

          <Pressable onPress={canSave ? handleSave : undefined}
            style={[s.saveBtn, { backgroundColor: canSave ? theme.accent : theme.surface, borderColor: theme.accent }]}>
            <Text style={[s.saveBtnText, { color: canSave ? theme.bg : theme.muted, fontFamily: FONTS.jetbrains }]}>
              {profile ? 'SAVE CHANGES' : '[+] CREATE PROFILE'}
            </Text>
          </Pressable>

          {profile && (
            <Pressable onPress={handleDelete} style={[s.deleteBtn, { borderColor: STATUS.red }]}>
              <Text style={[s.deleteBtnText, { color: STATUS.red, fontFamily: FONTS.jetbrains }]}>DELETE PROFILE</Text>
            </Pressable>
          )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export function PrintsScreen() {
  const theme = useTheme();
  const prints = useStore(s => s.data.prints);
  const syncFromServer = useStore(s => s.syncFromServer);
  const createProject = useStore(s => s.createProject);
  const section = useStore(s => s.section);
  const [tab, setTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Projects tab state
  const [newProjectModal, setNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [openProject, setOpenProject] = useState<PrintProject | null>(null);

  // Profiles tab state
  const [profileModal, setProfileModal] = useState(false);
  const [editProfile, setEditProfile] = useState<PrintProfile | undefined>();

  React.useEffect(() => { if (section !== 'prints') setTab(0); }, [section]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncFromServer().catch(() => {});
    setRefreshing(false);
  }, [syncFromServer]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim());
    setNewProjectName('');
    setNewProjectModal(false);
  };

  const projects = Array.isArray(prints?.projects) ? prints.projects : [];
  const profiles = Array.isArray(prints?.profiles) ? prints.profiles : [];
  const stats = prints?.stats ?? null;

  // Keep project reference fresh after sync
  const freshProject = openProject
    ? projects.find(p => p.id === openProject.id) ?? openProject
    : null;

  const onFabPress = () => {
    if (tab === 0) { setNewProjectName(''); setNewProjectModal(true); }
    else if (tab === 1) { setEditProfile(undefined); setProfileModal(true); }
  };

  return (
    <CRTScreen title="3D PRINTS">
      <SubTabs tabs={TABS} active={tab} onSelect={setTab} />

      {/* ── PROJECTS tab ── */}
      {tab === 0 && (
        <FlatList
          data={projects}
          keyExtractor={p => String(p.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 120, gap: 10, backgroundColor: theme.bg }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Box title="// NO PROJECTS">
              <Mono style={{ color: theme.muted }}>tap [+] to create your first project</Mono>
            </Box>
          }
          renderItem={({ item }) => {
            const matSummary = item.materials.map(m => `${m.material} ${m.grams}g`).join(' · ');
            return (
              <Pressable onPress={() => setOpenProject(item)}>
                <Box title={item.name}>
                  <View style={s.projRow}>
                    <View style={s.projStat}>
                      <Comment>{'// time'}</Comment>
                      <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                        {fmtTime(item.totalTime)}
                      </Text>
                    </View>
                    <View style={s.projStat}>
                      <Comment>{'// cost'}</Comment>
                      <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                        ${item.totalCost.toFixed(2)}
                      </Text>
                    </View>
                    <View style={s.projStat}>
                      <Comment>{'// prints'}</Comment>
                      <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>
                        {item.prints.length}
                      </Text>
                    </View>
                  </View>
                  {matSummary ? (
                    <Text style={[s.matLine, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>
                      {matSummary}
                    </Text>
                  ) : null}
                </Box>
              </Pressable>
            );
          }}
        />
      )}

      {/* ── PROFILES tab ── */}
      {tab === 1 && (
        <FlatList
          data={profiles}
          keyExtractor={p => String(p.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 120, gap: 10, backgroundColor: theme.bg }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Box title="// NO PROFILES">
              <Mono style={{ color: theme.muted }}>tap [+] to create a print profile</Mono>
            </Box>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => { setEditProfile(item); setProfileModal(true); }}>
              <Box title={item.name}>
                <View style={s.projRow}>
                  <View style={s.projStat}>
                    <Comment>{'// material'}</Comment>
                    <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{item.material}</Text>
                  </View>
                  <View style={s.projStat}>
                    <Comment>{'// $/kg'}</Comment>
                    <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>${item.filamentCostPerKg}</Text>
                  </View>
                  <View style={s.projStat}>
                    <Comment>{'// watt'}</Comment>
                    <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{item.printerWattage}W</Text>
                  </View>
                  <View style={s.projStat}>
                    <Comment>{'// $/kWh'}</Comment>
                    <Text style={[s.projVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>${item.electricityRate}</Text>
                  </View>
                </View>
              </Box>
            </Pressable>
          )}
        />
      )}

      {/* ── STATS tab ── */}
      {tab === 2 && (
        <FlatList
          data={[{ key: 'stats' }]}
          keyExtractor={i => i.key}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.accent} colors={[theme.accent]} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 120, gap: 10, backgroundColor: theme.bg }}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <Box title="// OVERVIEW">
              {stats && stats.total_prints > 0 ? (
                <>
                  <View style={s.statsGrid}>
                    {[
                      { label: 'TOTAL', val: String(stats.total_prints) },
                      { label: 'SUCCESS', val: `${stats.success_rate}%` },
                      { label: 'FILAMENT', val: `${stats.total_filament_g}g` },
                      { label: 'COST', val: `$${stats.total_cost.toFixed(2)}` },
                      { label: 'TIME', val: fmtTime(stats.total_print_time_min) },
                      { label: 'FAILED', val: String(stats.failed_prints) },
                    ].map(r => (
                      <View key={r.label} style={s.statCell}>
                        <Comment>{`// ${r.label}`}</Comment>
                        <Text style={[s.statVal, { color: theme.accentHot, fontFamily: FONTS.jetbrains }]}>{r.val}</Text>
                      </View>
                    ))}
                  </View>
                  {stats.by_material && Object.keys(stats.by_material).length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <Comment>{'// by material'}</Comment>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                        {Object.entries(stats.by_material).map(([mat, cnt]) => (
                          <Text key={mat} style={[s.matChip, { color: theme.accentDim, fontFamily: FONTS.jetbrains }]}>
                            {mat} · {cnt}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <Mono style={{ color: theme.muted }}>no prints logged yet</Mono>
              )}
            </Box>
          )}
        />
      )}

      <Fab onPress={onFabPress} />

      {/* New project modal */}
      <Modal visible={newProjectModal} transparent animationType="slide" onRequestClose={() => setNewProjectModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <Pressable style={s.scrim} onPress={() => setNewProjectModal(false)} />
          <View style={[s.sheet, { backgroundColor: theme.bg, borderTopColor: theme.accent, padding: 20 }]}>
            <Text style={[s.sheetTitle, { color: theme.muted, fontFamily: FONTS.jetbrains }]}>// NEW PROJECT</Text>
            <FieldLabel label="PROJECT NAME" />
            <Input value={newProjectName} onChange={setNewProjectName} placeholder="Enclosure, Functional parts..." />
            <Pressable onPress={handleCreateProject}
              style={[s.saveBtn, { backgroundColor: newProjectName.trim() ? theme.accent : theme.surface, borderColor: theme.accent, marginTop: 16 }]}>
              <Text style={[s.saveBtnText, { color: newProjectName.trim() ? theme.bg : theme.muted, fontFamily: FONTS.jetbrains }]}>
                [+] CREATE PROJECT
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Profile modal */}
      {profileModal && (
        <ProfileModal
          profile={editProfile}
          onClose={() => { setProfileModal(false); setEditProfile(undefined); }}
        />
      )}

      {/* Project detail */}
      {freshProject && (
        <ProjectDetailModal
          project={freshProject}
          profiles={profiles}
          onClose={() => setOpenProject(null)}
        />
      )}
    </CRTScreen>
  );
}

const s = StyleSheet.create({
  // Project items
  projRow: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  projStat: { flex: 1 },
  projVal: { fontSize: 16, marginTop: 2 },
  matLine: { fontSize: 10, letterSpacing: 0.6 },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  statCell: { minWidth: 80 },
  statVal: { fontSize: 18, marginTop: 2 },
  matChip: { fontSize: 10, letterSpacing: 0.8 },
  // Job rows
  jobRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
  jobName: { fontSize: 12, letterSpacing: 0.5 },
  jobMeta: { fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  jobCost: { fontSize: 13, letterSpacing: 0.5, paddingTop: 2 },
  qtyBadge: { fontSize: 10, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1, letterSpacing: 0.5 },
  // Project detail modal
  fullModal: { flex: 1 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
  detailTitle: { fontSize: 16, letterSpacing: 1 },
  detailMeta: { fontSize: 10, marginTop: 2 },
  closeBtn: { borderWidth: 1, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 12 },
  detailActions: { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1 },
  addPrintBtn: { flex: 1, borderWidth: 1, padding: 12, alignItems: 'center' },
  addPrintBtnText: { fontSize: 11, letterSpacing: 1.2, fontWeight: '700' },
  // Sheets
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { marginTop: 'auto', borderTopWidth: 1, maxHeight: '88%' },
  sheetTitle: { fontSize: 10, letterSpacing: 1.4, marginBottom: 8 },
  // Form
  costPreview: { padding: 10, borderWidth: 1, marginBottom: 14, gap: 4 },
  costLabel: { fontSize: 9, letterSpacing: 1.2, marginBottom: 4 },
  costItem: { fontSize: 11, letterSpacing: 0.5 },
  fieldLabel: { fontSize: 9, letterSpacing: 1.2, marginBottom: 4, marginTop: 10 },
  input: { borderWidth: 1, padding: 10, fontSize: 12, marginBottom: 2 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1 },
  chipText: { fontSize: 10, letterSpacing: 0.8 },
  saveBtn: { marginTop: 20, padding: 14, borderWidth: 1, alignItems: 'center' },
  saveBtnText: { fontSize: 12, letterSpacing: 1.2, fontWeight: '700' },
  deleteBtn: { marginTop: 10, padding: 14, borderWidth: 1, alignItems: 'center' },
  deleteBtnText: { fontSize: 12, letterSpacing: 1.2 },
});
