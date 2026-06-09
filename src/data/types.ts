export type SectionId = 'home' | 'spending' | 'jobs' | 'fitness' | 'portfolio' | 'climbing' | 'projects' | 'hydro';

export interface User {
  name: string;
  handle: string;
  role: string;
  loc: string;
  bio: string;
  github: string;
  website: string;
}

export interface Category { name: string; spent: number; budget: number; }
export interface Expense {
  id: string; createdAt: string;
  merchant: string; cat: string; catId: number; amt: number; over: boolean; date: string;
}
export interface Spending { budget: number; cats: Category[]; catIds: Record<string, number>; txns: Expense[]; }

export interface WorkoutSet {
  id: string; exercise: string;
  sets: number | null; reps: number | null; weight: number | null; duration: number | null;
}
export interface Workout { id: string; createdAt: string; name: string; min: number; sets: WorkoutSet[]; }
export interface Run { id: string; createdAt: string; label: string; distanceKm: number; paceSecPerKm: number; durationSec: number; }
export interface Fitness {
  streak: number; weight: number; weightHistory: number[]; weightDates: string[];
  weekSessions: number[]; workouts: Workout[];
  runs: Run[]; runWeekKm: number[]; runWeekLabels: string[];
}

export interface Send {
  id: string; createdAt: string;
  gym: string; route: string; grade: string;
  style: 'flash' | 'onsight' | 'redpoint' | 'project';
  climb_type: 'boulder' | 'sport';
  attempts: number;
  photo_path?: string;
}
export interface Climbing {
  pyramid: Record<string, number>; flashes: number; projects: number; sends: Send[];
}

export type ColId = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
export interface JobColumn { id: ColId; label: string; dot: string; }
export interface Job {
  id: string; createdAt: string;
  co: string; role: string; comp: string; loc: string; when: string;
  stage?: string; hot?: boolean;
}
export interface Jobs { cols: JobColumn[]; board: Record<ColId, Job[]>; }

export interface Tank {
  id: string; name: string;
  ph: number; ec: number; temp: number; water: number;
  plants: string[]; status: 'ok' | 'alert';
}
export interface Dose {
  id: string; createdAt: string;
  tank: string; what: string; amt: string; kind: 'accent' | 'amber' | 'dim';
}
export interface Hydro { tanks: Tank[]; doses: Dose[]; }

export interface Repo {
  name: string; todo: number; doing: number; done: number;
  active: boolean; lang: string; last: string; github: string;
}
export type TaskCol = 'todo' | 'doing' | 'review' | 'done';
export type TaskTag = 'feat' | 'bug' | 'design' | 'polish' | 'ui' | 'sec';
export interface Task {
  id: string; createdAt: string;
  title: string; tag: TaskTag; est: 'S' | 'M' | 'L'; sec: string; hot?: boolean;
}
export interface Projects { repos: Repo[]; commits: number[]; board: Record<TaskCol, Task[]>; }

export interface PortfolioItem {
  id: string; title: string; year: string; kind: string;
  status: 'live' | 'wip' | 'archived'; desc: string;
}
export interface Portfolio { items: PortfolioItem[]; }

export interface AppData {
  user: User; spending: Spending; fitness: Fitness;
  climbing: Climbing; jobs: Jobs; hydro: Hydro;
  projects: Projects; portfolio: Portfolio;
}

export interface Toast { id: number; text: string; kind: 'ok' | 'warn' | 'err'; }
