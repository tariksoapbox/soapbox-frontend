import type { AdminUser, Judge, ScoreEntry, Team } from '@/schemas/contracts';

export function team(overrides: Partial<Team> = {}): Team {
  return {
    id: 't1',
    name: 'Leteći Bosanci',
    bibNumber: 1,
    runTimeMs: null,
    runTime: null,
    ...overrides,
  };
}

export function user(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: 'u1',
    username: 'admin',
    displayName: 'Administrator',
    isActive: true,
    createdAt: '2026-08-21T09:00:00.000Z',
    ...overrides,
  };
}

export function score(overrides: Partial<ScoreEntry> = {}): ScoreEntry {
  return { teamId: 't1', judgeId: 'j1', criterion: 'vehicle', points: 9, ...overrides };
}

export function judge(overrides: Partial<Judge> = {}): Judge {
  return {
    id: 'j1',
    name: 'Buba Corelli',
    isActive: true,
    createdAt: '2026-08-21T09:00:00.000Z',
    ...overrides,
  };
}
