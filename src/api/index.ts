// All API endpoints. Each function returns typed data or throws on network failure.
import { apiFetch, storeSessionCookie, clearSessionCookie, getStoredCookie } from './client';
import { BASE_URL } from './config';
import {
  mapUser, mapSpending, mapFitness, mapClimbing,
  mapJobs, mapHydro, mapProjects, mapPortfolio,
  type ServerAnalytics,
} from './mappers';
import type { AppData } from '../data/types';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(username: string, password: string): Promise<{ username: string } | null> {
  const res = await apiFetch<{ user?: { username: string }; error?: string }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
  );
  if (!res.ok || !res.data.user) return null;
  return { username: res.data.user.username };
}

export async function apiMe(): Promise<{ username: string } | null> {
  const res = await apiFetch<{ user?: { username: string } | null }>('/api/auth/me');
  if (!res.ok || !res.data.user) return null;
  return { username: res.data.user.username };
}

export async function apiLogout(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  await clearSessionCookie();
}

// ── Load all data ─────────────────────────────────────────────────────────────

export async function apiLoadAll(user: { username: string }): Promise<Partial<AppData>> {
  const [
    cats, expenses, analytics,
    workouts, runs, metrics,
    climbs,
    jobs,
    hydReadings, hydDoses, hydPlants,
    devProjects, kanban,
    portfolio,
    about,
  ] = await Promise.all([
    apiFetch<unknown[]>('/api/categories'),
    apiFetch<unknown[]>('/api/expenses'),
    apiFetch<ServerAnalytics>('/api/analytics'),
    apiFetch<unknown[]>('/api/fitness/workouts'),
    apiFetch<unknown[]>('/api/runs'),
    apiFetch<unknown[]>('/api/fitness/metrics/history'),
    apiFetch<unknown[]>('/api/climbing'),
    apiFetch<unknown[]>('/api/jobs'),
    apiFetch<unknown[]>('/api/hydro/readings'),
    apiFetch<unknown[]>('/api/hydro/dosing'),
    apiFetch<unknown[]>('/api/hydro/plants'),
    apiFetch<unknown[]>('/api/dev-projects'),
    apiFetch<unknown[]>('/api/kanban'),
    apiFetch<unknown[]>('/api/portfolio/projects'),
    apiFetch<Record<string, string>>('/api/portfolio/about'),
  ]);

  return {
    user: mapUser(user.username, about.data ?? {}),
    spending: mapSpending(
      (cats.data as Parameters<typeof mapSpending>[0]) ?? [],
      (expenses.data as Parameters<typeof mapSpending>[1]) ?? [],
      analytics.data ?? {},
    ),
    fitness: mapFitness(
      (workouts.data as Parameters<typeof mapFitness>[0]) ?? [],
      (runs.data as Parameters<typeof mapFitness>[1]) ?? [],
      (metrics.data as Parameters<typeof mapFitness>[2]) ?? [],
    ),
    climbing: mapClimbing((climbs.data as Parameters<typeof mapClimbing>[0]) ?? []),
    jobs: mapJobs((jobs.data as Parameters<typeof mapJobs>[0]) ?? []),
    hydro: mapHydro(
      (hydReadings.data as Parameters<typeof mapHydro>[0]) ?? [],
      (hydDoses.data as Parameters<typeof mapHydro>[1]) ?? [],
      (hydPlants.data as Parameters<typeof mapHydro>[2]) ?? [],
    ),
    projects: mapProjects(
      (devProjects.data as Parameters<typeof mapProjects>[0]) ?? [],
      (kanban.data as Parameters<typeof mapProjects>[1]) ?? [],
    ),
    portfolio: mapPortfolio((portfolio.data as Parameters<typeof mapPortfolio>[0]) ?? []),
  };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function apiAddExpense(x: {
  description: string;
  amount: number;
  category_id: number;
  date: string;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(x),
  });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}

export async function apiGetCategoryId(catName: string): Promise<number | null> {
  const res = await apiFetch<{ id: number; name: string }[]>('/api/categories');
  const cat = res.data.find(c => c.name.toLowerCase() === catName.toLowerCase());
  return cat?.id ?? null;
}

export async function apiAddWorkout(x: {
  name: string;
  duration?: number;
  date: string;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>('/api/fitness/workouts', {
    method: 'POST',
    body: JSON.stringify(x),
  });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}

export async function apiAddClimb(x: {
  climb_type: string;
  name: string;
  location: string;
  my_grade: string;
  sent: number;
  flash: number;
  attempts: number;
  date: string;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>('/api/climbing', {
    method: 'POST',
    body: JSON.stringify(x),
  });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}

export async function apiUpdateClimb(id: string, x: {
  climb_type: string; name: string; location: string;
  my_grade: string; sent: number; flash: number; attempts: number; date: string;
}): Promise<void> {
  await apiFetch(`/api/climbing/${id}`, { method: 'PUT', body: JSON.stringify(x) });
}

export async function apiAddClimbPhoto(
  climbId: number,
  photo: { uri: string; type: string; name: string },
): Promise<void> {
  const cookie = await getStoredCookie();
  const form = new FormData();
  form.append('photo', { uri: photo.uri, type: photo.type, name: photo.name } as unknown as Blob);
  await fetch(`${BASE_URL}/api/climbing/${climbId}/photo`, {
    method: 'POST',
    headers: cookie ? { Cookie: `session=${cookie}` } : {},
    body: form,
  });
}

export async function apiUpdateExpense(id: string, x: {
  amount: number; description: string; category_id: number; date: string;
}): Promise<void> {
  await apiFetch(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(x) });
}

export async function apiDeleteExpense(id: string): Promise<void> {
  await apiFetch(`/api/expenses/${id}`, { method: 'DELETE' });
}

export async function apiUpdateWorkout(id: string, x: { name: string; duration?: number; date: string }): Promise<void> {
  await apiFetch(`/api/fitness/workouts/${id}`, { method: 'PUT', body: JSON.stringify(x) });
}

export async function apiDeleteWorkout(id: string): Promise<void> {
  await apiFetch(`/api/fitness/workouts/${id}`, { method: 'DELETE' });
}

export async function apiAddWorkoutSet(workoutId: string, x: {
  exercise: string; sets?: number | null; reps?: number | null; weight?: number | null; duration?: number | null;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>(`/api/fitness/workouts/${workoutId}/sets`, { method: 'POST', body: JSON.stringify(x) });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}

export async function apiUpdateWorkoutSet(setId: string, x: {
  exercise: string; sets?: number | null; reps?: number | null; weight?: number | null; duration?: number | null;
}): Promise<void> {
  await apiFetch(`/api/fitness/sets/${setId}`, { method: 'PUT', body: JSON.stringify(x) });
}

export async function apiDeleteWorkoutSet(setId: string): Promise<void> {
  await apiFetch(`/api/fitness/sets/${setId}`, { method: 'DELETE' });
}

export async function apiStravaImport(): Promise<{ imported: number }> {
  const res = await apiFetch<{ imported?: number }>('/api/strava/import', { method: 'POST' });
  return { imported: res.data.imported ?? 0 };
}

export async function apiAddJob(x: {
  company: string;
  role: string;
  salary?: string;
  status: string;
  date_applied: string;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(x),
  });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}

export async function apiAddKanbanTask(x: {
  title: string;
  status: string;
  priority: string;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>('/api/kanban', {
    method: 'POST',
    body: JSON.stringify(x),
  });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}

export async function apiLogDose(x: {
  dose_type: string;
  amount_ml: number;
  date: string;
  notes?: string;
}): Promise<{ id: number } | null> {
  const res = await apiFetch<{ id?: number }>('/api/hydro/dosing', {
    method: 'POST',
    body: JSON.stringify(x),
  });
  return res.ok && res.data.id ? { id: res.data.id } : null;
}
