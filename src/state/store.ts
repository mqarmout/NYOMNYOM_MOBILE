import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { seed } from './seed';
import type { AppData, SectionId, Toast, TaskTag } from '../data/types';
import type { PaletteName } from '../theme/palettes';
import type { FontName } from '../theme/type';
import {
  apiLogin, apiMe, apiLogout, apiLoadAll,
  apiAddExpense, apiGetCategoryId, apiUpdateExpense, apiDeleteExpense,
  apiAddIncome, apiUpdateIncome, apiDeleteIncome,
  apiCreateProject, apiDeleteProject, apiAddPrintToProject,
  apiUpdatePrint, apiDeletePrint,
  apiCreateProfile, apiUpdateProfile, apiDeleteProfile,
  apiAddWorkout, apiUpdateWorkout, apiDeleteWorkout,
  apiAddWorkoutSet, apiUpdateWorkoutSet, apiDeleteWorkoutSet,
  apiAddClimb, apiAddClimbPhoto, apiUpdateClimb,
  apiAddJob, apiAddKanbanTask, apiLogDose, apiStravaImport,
  apiAddBodyWeight, apiAddPrint,
} from '../api';

export const PAGER: SectionId[] = [
  'home', 'spending', 'fitness', 'climbing', 'hydro', 'jobs', 'portfolio', 'projects', 'prints'
];

interface AppState {
  auth: { name: string } | null;
  hydrated: boolean;
  syncing: boolean;
  section: SectionId;
  palette: PaletteName;
  font: FontName;
  homeMode: 'dash' | 'brief' | 'grid';
  toasts: Toast[];
  data: AppData;

  login(name: string, password?: string): Promise<void>;
  logout(): Promise<void>;
  syncFromServer(): Promise<void>;
  go(s: SectionId): void;
  setPalette(p: PaletteName): void;
  setFont(f: FontName): void;
  setHomeMode(m: 'dash' | 'brief' | 'grid'): void;
  pushToast(text: string, kind?: Toast['kind']): void;
  clearToast(id: number): void;

  addExpense(x: { merchant: string; target?: string; amt: string | number; cat: string }): void;
  addIncome(x: { description: string; amount: number; source: string; date: string }): void;
  updateExpense(x: { id: string; merchant: string; amt: number; cat: string; catId: number; date: string }): void;
  deleteExpense(id: string): void;
  updateIncome(x: { id: string; description: string; source: string; amt: number; date: string }): void;
  deleteIncome(id: string): void;
  addWorkout(x: { name: string; min?: string | number }): void;
  updateWorkout(x: { id: string; name: string; min: number }): void;
  deleteWorkout(id: string): void;
  updateWorkoutSet(x: { workoutId: string; setId: string; exercise: string; sets: number | null; reps: number | null; weight: number | null; duration: number | null }): void;
  deleteWorkoutSet(x: { workoutId: string; setId: string }): void;
  stravaImport(): Promise<void>;
  logSend(x: { route: string; grade: string; style: string; gym?: string; climb_type?: string; attempts?: number; photo?: { uri: string; type: string; name: string } }): void;
  updateClimb(x: { id: string; route: string; grade: string; style: string; gym?: string; climb_type?: string; attempts?: number; photo?: { uri: string; type: string; name: string } }): void;
  logDose(x: { tank: string; what: string; amt?: string }): void;
  addApplication(x: { co: string; role: string; comp: string }): void;
  addTask(x: { title: string; tag: string }): void;
  addBodyWeight(x: { weight: number; date: string }): Promise<void>;
  addPrint(x: { name: string; print_time_min: number; filament_used_g: number; filament_cost_per_kg?: number; printer_wattage?: number; electricity_rate?: number; material?: string; color?: string; status?: string; notes?: string }): Promise<void>;
  createProject(name: string, notes?: string): Promise<void>;
  deleteProject(id: number): Promise<void>;
  addPrintToProject(projectId: number, x: { name: string; print_time_min: number; filament_used_g: number; filament_cost_per_kg?: number; printer_wattage?: number; electricity_rate?: number; material?: string; color?: string; status?: string; notes?: string; quantity?: number }): Promise<void>;
  updatePrint(id: number, x: object): Promise<void>;
  deletePrint(id: number): Promise<void>;
  createProfile(x: { name: string; material: string; filament_cost_per_kg: number; printer_wattage: number; electricity_rate: number }): Promise<void>;
  updateProfile(id: number, x: object): Promise<void>;
  deleteProfile(id: number): Promise<void>;
  reset(): void;
}

function nowIso() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0, 10); }
function nanoid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: null,
      hydrated: false,
      syncing: false,
      section: 'home',
      palette: 'green',
      font: 'jetbrains',
      homeMode: 'dash',
      toasts: [],
      data: seed(),

      async login(name, password) {
        const n = (name || '').trim();
        if (!n) return;

        // Try server auth first; fall back to local-only if no password given
        if (password) {
          const user = await apiLogin(n, password).catch(() => null);
          if (user) {
            set({ auth: { name: user.username }, section: 'home' });
            get().pushToast('system booted · welcome ' + user.username, 'ok');
            await get().syncFromServer().catch(() => {});
            return;
          }
          get().pushToast('invalid credentials', 'err');
          return;
        }

        // Local-only (dev / seed mode)
        set({ auth: { name: n }, section: 'home' });
        get().pushToast('system booted · welcome ' + n, 'ok');
      },

      async logout() {
        await apiLogout().catch(() => {});
        set({ auth: null, section: 'home', data: seed() });
      },

      async syncFromServer() {
        const { auth } = get();
        if (!auth) return;
        set({ syncing: true });
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const partial = await apiLoadAll({ username: auth.name });
            set(s => ({
              syncing: false,
              data: { ...s.data, ...partial },
            }));
            return;
          } catch {
            if (attempt === 0) await new Promise(r => setTimeout(r, 3000));
          }
        }
        set({ syncing: false });
        get().pushToast('sync failed — using cached data', 'warn');
      },

      go(s) { if (PAGER.includes(s)) set({ section: s }); },
      setPalette(p) { set({ palette: p }); },
      setFont(f) { set({ font: f }); },
      setHomeMode(m) { set({ homeMode: m }); },

      pushToast(text, kind = 'ok') {
        const id = Date.now() + Math.random();
        set(s => ({ toasts: [...s.toasts, { id, text, kind }] }));
        setTimeout(() => get().clearToast(id), 2800);
      },
      clearToast(id) {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
      },

      addExpense({ merchant, target, amt, cat }) {
        const a = Math.abs(parseFloat(String(amt)) || 0);
        set(s => {
          const d = structuredClone(s.data);
          const c = d.spending.cats.find(x => x.name === cat);
          const over = c ? c.spent + a > c.budget : false;
          d.spending.txns.unshift({ id: nanoid(), createdAt: nowIso(), merchant: merchant || 'untitled', target, cat: cat || 'misc', catId: 0, amt: a, over, date: today() });
          if (c) c.spent = +(c.spent + a).toFixed(2);
          return { data: d };
        });
        get().pushToast('logged $' + a.toFixed(2) + ' · ' + (cat || 'misc'), 'ok');
        apiGetCategoryId(cat).then((catId: number | null) => {
          if (!catId) return;
          return apiAddExpense({ description: merchant, target, amount: a, category_id: catId, date: today() });
        }).catch(() => {});
      },

      addIncome({ description, amount, source, date }) {
        set(s => {
          const d = structuredClone(s.data);
          d.spending.income.unshift({ id: nanoid(), createdAt: nowIso(), description, source, amt: amount, date });
          return { data: d };
        });
        get().pushToast('income +$' + amount.toFixed(2), 'ok');
        apiAddIncome({ description, amount, source, date }).catch(() => {});
      },

      addWorkout({ name, min }) {
        set(s => {
          const d = structuredClone(s.data);
          d.fitness.workouts.unshift({ id: nanoid(), createdAt: nowIso(), name: name || 'Session', min: parseInt(String(min ?? 45)) || 45, sets: [] });
          return { data: d };
        });
        get().pushToast('workout logged · ' + (name || 'session'), 'ok');
        apiAddWorkout({ name: name || 'Session', duration: parseInt(String(min ?? 45)) || 45, date: today() }).catch(() => {});
      },

      updateExpense({ id, merchant, amt, cat, catId, date }) {
        set(s => {
          const d = structuredClone(s.data);
          const idx = d.spending.txns.findIndex(t => t.id === id);
          if (idx >= 0) d.spending.txns[idx] = { ...d.spending.txns[idx]!, merchant, amt, cat, catId, date };
          return { data: d };
        });
        get().pushToast('expense updated', 'ok');
        apiUpdateExpense(id, { amount: amt, description: merchant, category_id: catId, date }).catch(() => {});
        setTimeout(() => get().syncFromServer(), 500);
      },

      deleteExpense(id) {
        set(s => {
          const d = structuredClone(s.data);
          d.spending.txns = d.spending.txns.filter(t => t.id !== id);
          return { data: d };
        });
        get().pushToast('expense deleted', 'ok');
        apiDeleteExpense(id).catch(() => {});
      },

      updateIncome({ id, description, source, amt, date }) {
        set(s => {
          const d = structuredClone(s.data);
          const idx = d.spending.income.findIndex(i => i.id === id);
          if (idx >= 0) d.spending.income[idx] = { ...d.spending.income[idx]!, description, source, amt, date };
          return { data: d };
        });
        get().pushToast('income updated', 'ok');
        apiUpdateIncome(id, { amount: amt, description, source, date }).catch(() => {});
        setTimeout(() => get().syncFromServer(), 500);
      },

      deleteIncome(id) {
        set(s => {
          const d = structuredClone(s.data);
          d.spending.income = d.spending.income.filter(i => i.id !== id);
          return { data: d };
        });
        get().pushToast('income deleted', 'ok');
        apiDeleteIncome(id).catch(() => {});
      },

      updateWorkout({ id, name, min }) {
        set(s => {
          const d = structuredClone(s.data);
          const w = d.fitness.workouts.find(w => w.id === id);
          if (w) { w.name = name; w.min = min; }
          return { data: d };
        });
        get().pushToast('workout updated', 'ok');
        apiUpdateWorkout(id, { name, duration: min, date: today() }).catch(() => {});
      },

      deleteWorkout(id) {
        set(s => {
          const d = structuredClone(s.data);
          d.fitness.workouts = d.fitness.workouts.filter(w => w.id !== id);
          return { data: d };
        });
        get().pushToast('workout deleted', 'ok');
        apiDeleteWorkout(id).catch(() => {});
      },

      updateWorkoutSet({ workoutId, setId, exercise, sets, reps, weight, duration }) {
        set(s => {
          const d = structuredClone(s.data);
          const w = d.fitness.workouts.find(w => w.id === workoutId);
          if (w) {
            const si = w.sets.findIndex(s => s.id === setId);
            if (si >= 0) w.sets[si] = { id: setId, exercise, sets, reps, weight, duration };
          }
          return { data: d };
        });
        apiUpdateWorkoutSet(setId, { exercise, sets, reps, weight, duration }).catch(() => {});
      },

      deleteWorkoutSet({ workoutId, setId }) {
        set(s => {
          const d = structuredClone(s.data);
          const w = d.fitness.workouts.find(w => w.id === workoutId);
          if (w) w.sets = w.sets.filter(s => s.id !== setId);
          return { data: d };
        });
        apiDeleteWorkoutSet(setId).catch(() => {});
      },

      async stravaImport() {
        const { auth } = get();
        if (!auth) return;
        set({ syncing: true });
        try {
          const result = await apiStravaImport();
          await get().syncFromServer();
          if (result.imported > 0) get().pushToast(`${result.imported} new runs imported`, 'ok');
          else get().pushToast('runs up to date', 'ok');
        } catch {
          set({ syncing: false });
          get().pushToast('strava sync failed', 'warn');
        }
      },

      logSend({ route, grade, style, gym, climb_type, attempts, photo }) {
        const g = (grade || 'V2').toUpperCase();
        const ct = (climb_type || 'boulder') as 'boulder' | 'sport';
        const att = attempts ?? 1;
        set(s => {
          const d = structuredClone(s.data);
          d.climbing.sends.unshift({ id: nanoid(), createdAt: nowIso(), gym: gym || '', route: route || 'unnamed', grade: g, style: (style as 'flash' | 'onsight' | 'redpoint' | 'project') || 'redpoint', climb_type: ct, attempts: att });
          d.climbing.pyramid[g] = (d.climbing.pyramid[g] ?? 0) + 1;
          if (style === 'flash' || style === 'onsight') d.climbing.flashes += 1;
          return { data: d };
        });
        get().pushToast('send logged · ' + g + ' ' + (route || ''), 'ok');
        apiAddClimb({
          climb_type: ct,
          name: route || 'unnamed',
          location: gym || '',
          my_grade: g,
          sent: 1,
          flash: style === 'flash' ? 1 : 0,
          attempts: att,
          date: today(),
        }).then(result => {
          if (result && photo) {
            return apiAddClimbPhoto(result.id, photo);
          }
        }).then(() => {
          if (photo) get().syncFromServer();
        }).catch(() => {});
      },

      updateClimb({ id, route, grade, style, gym, climb_type, attempts, photo }) {
        const g = (grade || 'V2').toUpperCase();
        const ct = (climb_type || 'boulder') as 'boulder' | 'sport';
        const att = attempts ?? 1;
        set(s => {
          const d = structuredClone(s.data);
          const idx = d.climbing.sends.findIndex(send => send.id === id);
          if (idx >= 0) {
            d.climbing.sends[idx] = { ...d.climbing.sends[idx]!, route: route || 'unnamed', grade: g, style: (style as 'flash' | 'onsight' | 'redpoint' | 'project') || 'redpoint', gym: gym || '', climb_type: ct, attempts: att };
          }
          return { data: d };
        });
        get().pushToast('send updated', 'ok');
        apiUpdateClimb(id, { climb_type: ct, name: route || 'unnamed', location: gym || '', my_grade: g, sent: 1, flash: style === 'flash' ? 1 : 0, attempts: att, date: today() }).then(() => {
          if (photo) return apiAddClimbPhoto(parseInt(id), photo);
        }).then(() => {
          get().syncFromServer();
        }).catch(() => {});
      },

      logDose({ tank, what, amt }) {
        set(s => {
          const d = structuredClone(s.data);
          d.hydro.doses.unshift({ id: nanoid(), createdAt: nowIso(), tank: tank || 'T1', what: what || 'flora-A', amt: amt || '5ml', kind: 'accent' });
          return { data: d };
        });
        get().pushToast('dose logged · ' + (tank || 'T1') + ' ' + (what || ''), 'ok');
        const ml = parseFloat((amt ?? '5ml').replace(/[^0-9.]/g, '')) || 5;
        apiLogDose({ dose_type: what || 'other', amount_ml: ml, date: today() }).catch(() => {});
      },

      addApplication({ co, role, comp }) {
        set(s => {
          const d = structuredClone(s.data);
          d.jobs.board.applied.unshift({ id: nanoid(), createdAt: nowIso(), co: co || 'company', role: role || 'role', when: today(), comp: comp || '—', loc: 'remote' });
          return { data: d };
        });
        get().pushToast('application added · ' + (co || ''), 'ok');
        apiAddJob({ company: co, role, salary: comp, status: 'applied', date_applied: today() }).catch(() => {});
      },

      addTask({ title, tag }) {
        set(s => {
          const d = structuredClone(s.data);
          d.projects.board.todo.unshift({ id: nanoid(), createdAt: nowIso(), title: title || 'new task', tag: (tag as TaskTag) || 'feat', est: 'M', sec: 'home' });
          return { data: d };
        });
        get().pushToast('task added to todo', 'ok');
        apiAddKanbanTask({ title: title || 'new task', status: 'backlog', priority: 'medium' }).catch(() => {});
      },

      async addBodyWeight({ weight, date }) {
        await apiAddBodyWeight({ weight, date }).catch(() => {});
        await get().syncFromServer();
        get().pushToast(`${weight}kg logged`, 'ok');
      },

      async addPrint(x) {
        await apiAddPrint(x).catch(() => {});
        await get().syncFromServer();
        get().pushToast('print logged', 'ok');
      },

      async createProject(name, notes) {
        await apiCreateProject(name, notes).catch(() => {});
        await get().syncFromServer();
        get().pushToast('project created', 'ok');
      },

      async deleteProject(id) {
        await apiDeleteProject(id).catch(() => {});
        await get().syncFromServer();
        get().pushToast('project deleted', 'ok');
      },

      async addPrintToProject(projectId, x) {
        await apiAddPrintToProject(projectId, x).catch(() => {});
        await get().syncFromServer();
        get().pushToast('print logged', 'ok');
      },

      async updatePrint(id, x) {
        await apiUpdatePrint(id, x).catch(() => {});
        await get().syncFromServer();
        get().pushToast('print updated', 'ok');
      },

      async deletePrint(id) {
        await apiDeletePrint(id).catch(() => {});
        await get().syncFromServer();
        get().pushToast('print deleted', 'ok');
      },

      async createProfile(x) {
        await apiCreateProfile(x).catch(() => {});
        await get().syncFromServer();
        get().pushToast('profile saved', 'ok');
      },

      async updateProfile(id, x) {
        await apiUpdateProfile(id, x).catch(() => {});
        await get().syncFromServer();
        get().pushToast('profile updated', 'ok');
      },

      async deleteProfile(id) {
        await apiDeleteProfile(id).catch(() => {});
        await get().syncFromServer();
        get().pushToast('profile deleted', 'ok');
      },

      reset() {
        set({ data: seed() });
        get().pushToast('data reset to defaults', 'ok');
      },
    }),
    {
      name: 'nyomnyom_phone_v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        auth: s.auth,
        palette: s.palette,
        font: s.font,
        homeMode: s.homeMode,
        data: s.data,
      }),
      onRehydrateStorage: () => (state) => {
        useStore.setState({ hydrated: true });
        // On rehydrate, check if server session is still valid and sync
        if (state?.auth) {
          apiMe()
            .then((user: { username: string } | null) => {
              if (user) return useStore.getState().syncFromServer();
              else useStore.setState({ auth: null, data: seed() });
            })
            .catch(() => {});
        }
      },
    }
  )
);

export function spendTotals(spending: AppData['spending']) {
  const monthTotal = Math.round(spending.cats.reduce((s, c) => s + c.spent, 0));
  return { monthTotal, budget: spending.budget, pct: Math.round((monthTotal / spending.budget) * 100), left: spending.budget - monthTotal };
}

export function climbStats(climbing: AppData['climbing']) {
  const sent = Object.values(climbing.pyramid).reduce((s, n) => s + n, 0);
  const grades = Object.keys(climbing.pyramid).filter(g => (climbing.pyramid[g] ?? 0) > 0).sort();
  const max = grades.length ? grades[grades.length - 1] ?? 'V0' : 'V0';
  return { sent, max, flashes: climbing.flashes, projects: climbing.projects };
}
