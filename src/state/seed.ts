import type { AppData } from '../data/types';

export function seed(): AppData {
  return {
    user: { name: '', handle: '', role: '', loc: '', bio: '', github: '', website: '' },
    spending: {
      budget: 0,
      cats: [],
      txns: [],
    },
    fitness: {
      streak: 0,
      weight: 0,
      weightHistory: [],
      weightDates: [],
      weekSessions: [0, 0, 0, 0, 0, 0, 0],
      workouts: [],
      runs: [],
      runWeekKm: [],
      runWeekLabels: [],
    },
    climbing: {
      pyramid: {},
      flashes: 0,
      projects: 0,
      sends: [],
    },
    jobs: {
      cols: [
        { id: 'applied',   label: 'APPLIED',   dot: '#7ab5ff' },
        { id: 'screening', label: 'SCREENING', dot: '#ffc55a' },
        { id: 'interview', label: 'INTERVIEW', dot: '#ffa83c' },
        { id: 'offer',     label: 'OFFER',     dot: '#3aff7a' },
        { id: 'rejected',  label: 'REJECTED',  dot: '#ff6a5a' },
      ],
      board: {
        applied: [], screening: [], interview: [], offer: [], rejected: [],
      },
    },
    hydro: {
      tanks: [],
      doses: [],
    },
    projects: {
      repos: [],
      commits: [],
      board: {
        todo: [], doing: [], review: [], done: [],
      },
    },
    portfolio: {
      items: [],
    },
  };
}
