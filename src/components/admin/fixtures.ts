import type { AdminUser, ScoreEntry, Team } from '@/schemas/contracts';

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
    username: 'sudija1',
    displayName: 'Sudija 1',
    role: 'referee',
    isActive: true,
    createdAt: '2026-08-21T09:00:00.000Z',
    ...overrides,
  };
}

export function score(overrides: Partial<ScoreEntry> = {}): ScoreEntry {
  return {
    id: 's1',
    teamId: 't1',
    judgeId: 'u1',
    criterion: 'vehicle',
    points: 9,
    submittedAt: '2026-08-21T10:00:00.000Z',
    ...overrides,
  };
}
