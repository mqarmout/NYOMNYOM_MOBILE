// Maps server response shapes → store types.
// Server uses snake_case column names; store uses camelCase with different field names.
import type {
  AppData, User, Category, Expense, Spending,
  Workout, Run, Fitness,
  Send, Climbing,
  ColId, Job, Jobs,
  Dose, Hydro, Tank,
  Task, TaskCol, TaskTag, Repo, Projects,
  PortfolioItem, Portfolio,
} from '../data/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function sid(n: number): string { return String(n); }
function now(): string { return new Date().toISOString(); }

// ── User profile ─────────────────────────────────────────────────────────────

interface ServerAbout {
  display_name?: string; headline?: string; bio?: string;
  location?: string; website?: string; github?: string; linkedin?: string;
}

export function mapUser(username: string, about: ServerAbout): User {
  return {
    name: about.display_name || username,
    handle: about.github ? about.github.replace(/^https?:\/\/(www\.)?github\.com\//, '') : username,
    role: about.headline ?? '',
    loc: about.location ?? '',
    bio: about.bio ?? '',
    github: about.github ?? '',
    website: about.website ?? '',
  };
}

// ── Spending ──────────────────────────────────────────────────────────────────

interface ServerCategory {
  id: number; name: string; budget: number | null;
  icon: string; spent?: number;
}

interface ServerExpense {
  id: number; amount: number; description: string;
  category_id: number; category_name: string;
  date: string; created_at: string;
}

export interface ServerAnalytics {
  effective_budget?: number;
  total?: number;
  by_category?: ServerCategory[];
}

export function mapSpending(
  serverCats: ServerCategory[],
  serverExpenses: ServerExpense[],
  analytics: ServerAnalytics = {},
): Spending {
  // by_category from analytics includes per-category spent for the current month
  const cats: ServerCategory[] = analytics.by_category ?? serverCats;
  const budget = analytics.effective_budget ?? 0;

  const mappedCats: Category[] = cats.map(c => ({
    name: c.name,
    spent: Number(c.spent ?? 0),
    budget: Number(c.budget ?? 0),
  }));

  const catSpentMap: Record<string, number> = {};
  const catBudgetMap: Record<string, number> = {};
  for (const c of cats) {
    catSpentMap[c.name] = Number(c.spent ?? 0);
    catBudgetMap[c.name] = Number(c.budget ?? 0);
  }

  const txns: Expense[] = serverExpenses
    .filter(e => !e.description.startsWith('__recurring'))
    .map(e => {
      const catBudget = catBudgetMap[e.category_name] ?? 0;
      const catSpent = catSpentMap[e.category_name] ?? 0;
      return {
        id: sid(e.id),
        createdAt: e.created_at,
        merchant: e.description,
        cat: e.category_name,
        amt: Number(e.amount),
        over: catBudget > 0 && catSpent > catBudget,
      };
    });

  return { budget, cats: mappedCats, txns };
}

// ── Fitness ───────────────────────────────────────────────────────────────────

interface ServerWorkout {
  id: number; name: string; duration: number | null;
  created_at: string; sets?: unknown[];
}

interface ServerRun {
  id: number; title: string | null; distance_km: number;
  duration_seconds: number; date: string; created_at: string;
}

interface ServerMetric { weight: number; date: string; }

export function mapFitness(
  serverWorkouts: ServerWorkout[],
  serverRuns: ServerRun[],
  serverMetrics: ServerMetric[],
): Fitness {
  const workouts: Workout[] = serverWorkouts.map(w => ({
    id: sid(w.id),
    createdAt: w.created_at,
    name: w.name,
    min: w.duration ?? 45,
    sets: Array.isArray(w.sets) ? w.sets.length : 0,
  }));

  const runs: Run[] = serverRuns.map(r => {
    const pace = r.duration_seconds > 0 && r.distance_km > 0
      ? Math.round(r.duration_seconds / r.distance_km)
      : 0;
    return {
      id: sid(r.id),
      createdAt: r.created_at,
      label: r.title ?? `${r.distance_km.toFixed(1)} km`,
      distanceKm: r.distance_km,
      paceSecPerKm: pace,
      durationSec: r.duration_seconds,
    };
  });

  const latestWeight = serverMetrics[0]?.weight ?? 0;
  const weightHistory = serverMetrics.slice(0, 12).map(m => m.weight).reverse();

  // Compute 7-day session counts (Mon–Sun of current week)
  const weekSessions = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  for (const w of serverWorkouts) {
    const d = new Date(w.created_at);
    const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) weekSessions[diff] = (weekSessions[diff] ?? 0) + 1;
  }

  // Streak: consecutive days with at least one workout ending today/yesterday
  const dateCounts: Record<string, number> = {};
  for (const w of serverWorkouts) {
    const d = w.created_at.slice(0, 10);
    dateCounts[d] = (dateCounts[d] ?? 0) + 1;
  }
  let streak = 0;
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);
  while (dateCounts[cur.toISOString().slice(0, 10)]) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  const runWeekKm: number[] = [];
  const runWeekLabels: string[] = [];
  // Last 8 weeks of run km
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const km = serverRuns
      .filter(r => {
        const d = new Date(r.date);
        return d >= weekStart && d < weekEnd;
      })
      .reduce((s, r) => s + r.distance_km, 0);
    runWeekKm.push(Math.round(km * 10) / 10);
    runWeekLabels.push(weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  const weightDates = serverMetrics.slice(0, 12).map(m =>
    new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  ).reverse();

  return { streak, weight: latestWeight, weightHistory, weightDates, weekSessions, workouts, runs, runWeekKm, runWeekLabels };
}

// ── Climbing ──────────────────────────────────────────────────────────────────

interface ServerClimb {
  id: number; name: string | null; location: string | null;
  climb_type: string | null;
  my_grade: string | null; setter_grade: string | null;
  sent: number; flash: number; attempts: number;
  date: string; created_at: string;
  photo_path: string | null;
}

export function mapClimbing(serverClimbs: ServerClimb[]): Climbing {
  const sentClimbs = serverClimbs.filter(c => c.sent);
  const pyramid: Record<string, number> = {};
  let flashes = 0;
  let projects = 0;

  const sends: Send[] = sentClimbs.map(c => {
    const grade = (c.my_grade ?? c.setter_grade ?? 'V?').toUpperCase();
    pyramid[grade] = (pyramid[grade] ?? 0) + 1;
    let style: Send['style'];
    if (c.flash) { style = 'flash'; flashes++; }
    else if (c.attempts === 1) style = 'onsight';
    else style = 'redpoint';
    return {
      id: sid(c.id),
      createdAt: c.date ?? c.created_at,
      gym: c.location ?? '',
      route: c.name ?? 'unnamed',
      grade,
      style,
      climb_type: (c.climb_type === 'sport' ? 'sport' : 'boulder') as 'boulder' | 'sport',
      attempts: c.attempts ?? 1,
      photo_path: c.photo_path ?? undefined,
    };
  });

  projects = serverClimbs.filter(c => !c.sent).length;

  return { pyramid, flashes, projects, sends };
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

interface ServerJob {
  id: number; company: string; role: string;
  status: string; salary: string | null; site_used: string | null;
  date_applied: string | null; created_at: string;
  notes: string | null;
}

const STATUS_MAP: Record<string, ColId> = {
  applied: 'applied', screening: 'screening',
  interviewing: 'interview', interview: 'interview',
  offer: 'offer', rejected: 'rejected',
};

const JOB_COLS = [
  { id: 'applied'   as ColId, label: 'Applied',    dot: '#7ab5ff' },
  { id: 'screening' as ColId, label: 'Screening',  dot: '#ffc55a' },
  { id: 'interview' as ColId, label: 'Interview',  dot: '#ffa83c' },
  { id: 'offer'     as ColId, label: 'Offer',      dot: '#3aff7a' },
  { id: 'rejected'  as ColId, label: 'Rejected',   dot: '#ff6a5a' },
];

export function mapJobs(serverJobs: ServerJob[]): Jobs {
  const board: Jobs['board'] = {
    applied: [], screening: [], interview: [], offer: [], rejected: [],
  };

  for (const j of serverJobs) {
    const col = STATUS_MAP[j.status] ?? 'applied';
    board[col].push({
      id: sid(j.id),
      createdAt: j.created_at,
      co: j.company,
      role: j.role,
      comp: j.salary ?? '—',
      loc: j.site_used ?? '',
      when: j.date_applied ?? j.created_at.slice(0, 10),
    });
  }

  return { cols: JOB_COLS, board };
}

// ── Hydro ─────────────────────────────────────────────────────────────────────

interface ServerReading {
  ph: number | null; ec_ppm: number | null;
  water_temp: number | null; water_level: number | null;
  recorded_at: string;
}

interface ServerDose {
  id: number; dose_type: string; amount_ml: number;
  notes: string | null; created_at: string; date: string;
}

interface ServerPlant { id: number; name: string; active: number; }

export function mapHydro(
  readings: ServerReading[],
  serverDoses: ServerDose[],
  serverPlants: ServerPlant[],
): Hydro {
  const latest = readings[0];
  const activePlants = serverPlants.filter(p => p.active).map(p => p.name);

  const ph = latest?.ph ?? 0;
  const ec = latest?.ec_ppm ?? 0;
  const temp = latest?.water_temp ?? 0;
  const water = latest?.water_level ?? 0;

  const isAlert = ph > 0 && (ph < 5.5 || ph > 7.0 || water < 20);

  const tank: Tank = {
    id: 'T1', name: 'Tower 1',
    ph, ec, temp, water,
    plants: activePlants,
    status: isAlert ? 'alert' : 'ok',
  };

  const doses: Dose[] = serverDoses.map(d => ({
    id: sid(d.id),
    createdAt: d.created_at,
    tank: 'T1',
    what: d.dose_type,
    amt: `${d.amount_ml}ml`,
    kind: d.dose_type.startsWith('ph') ? ('amber' as const) : ('accent' as const),
  }));

  return { tanks: [tank], doses };
}

// ── Projects ──────────────────────────────────────────────────────────────────

interface ServerDevProject {
  id: number; name: string; status: string;
  tech_stack: string | null; github_url: string | null;
  created_at: string; start_date: string | null;
  todos?: { done: number }[];
}

interface ServerKanbanTask {
  id: number; title: string; status: string;
  priority: string; created_at: string;
}

const TASK_STATUS_MAP: Record<string, TaskCol> = {
  backlog: 'todo', in_progress: 'doing', done: 'done',
};

export function mapProjects(
  serverProjects: ServerDevProject[],
  serverTasks: ServerKanbanTask[],
): Projects {
  const repos: Repo[] = serverProjects.map(p => ({
    name: p.name,
    todo: p.todos?.filter(t => !t.done).length ?? 0,
    doing: 0,
    done: p.todos?.filter(t => t.done).length ?? 0,
    active: p.status === 'active',
    lang: (p.tech_stack ?? '').split(',')[0]?.trim() ?? '',
    last: (p.start_date ?? p.created_at).slice(0, 10),
    github: p.github_url ?? '',
  }));

  const board: Projects['board'] = { todo: [], doing: [], review: [], done: [] };

  for (const t of serverTasks) {
    const col = TASK_STATUS_MAP[t.status] ?? 'todo';
    board[col].push({
      id: sid(t.id),
      createdAt: t.created_at,
      title: t.title,
      tag: 'feat' as TaskTag,
      est: 'M' as const,
      sec: 'home',
    });
  }

  return { repos, commits: [], board };
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

interface ServerPortfolioProject {
  id: number; title: string; description: string | null;
  status: string; tech_stack: string | null;
  created_at: string; year: string | null; url: string | null;
}

export function mapPortfolio(serverProjects: ServerPortfolioProject[]): Portfolio {
  const items: PortfolioItem[] = serverProjects.map(p => ({
    id: sid(p.id),
    title: p.title,
    year: p.year ?? p.created_at.slice(0, 4),
    kind: p.tech_stack ?? '',
    status: (p.status as PortfolioItem['status']) ?? 'live',
    desc: p.description ?? '',
  }));
  return { items };
}
