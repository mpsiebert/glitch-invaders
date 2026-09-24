import type { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'glitch_invaders_leaderboard';

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'SEN', score: 12500, date: '2026-09-01', bountiesFixed: 3 },
  { id: '2', name: 'TRY', score: 9800, date: '2026-09-05', bountiesFixed: 3 },
  { id: '3', name: 'BUG', score: 7400, date: '2026-09-10', bountiesFixed: 2 },
  { id: '4', name: 'AGY', score: 5200, date: '2026-09-15', bountiesFixed: 2 },
  { id: '5', name: 'DEV', score: 3100, date: '2026-09-20', bountiesFixed: 1 },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score).slice(0, 10);
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_LEADERBOARD;
}

export function saveLeaderboardEntry(name: string, score: number, bountiesFixed: number): LeaderboardEntry[] {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    id: Date.now().toString(36),
    name: name.toUpperCase().slice(0, 3) || 'AAA',
    score,
    date: new Date().toISOString().split('T')[0],
    bountiesFixed,
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return updated;
}
