import type { PublicStandings, PublicTeam } from '@/schemas/contracts';

export function publicTeam(overrides: Partial<PublicTeam> = {}): PublicTeam {
  return {
    id: 't1',
    name: 'Leteći Bosanci',
    bibNumber: 1,
    rank: 1,
    placementSum: 3,
    final: true,
    vehicle: { total: 17, rank: 1, entered: 2, complete: true, marks: [] },
    performance: { total: 19, rank: 1, entered: 2, complete: true, marks: [] },
    time: { ms: 117230, formatted: '1:57.23', rank: 1 },
    ...overrides,
  };
}

export function publicStandings(
  teams: PublicTeam[],
  overrides: Partial<PublicStandings['event']> = {},
): PublicStandings {
  return {
    event: {
      judgeCount: 2,
      teamCount: teams.length,
      complete: teams.length > 0 && teams.every((t) => t.final),
      computedAt: '2026-09-01T10:04:05.000Z',
      ...overrides,
    },
    criteria: ['vehicle', 'performance'],
    judges: [
      { id: 'j1', name: 'John Doe' },
      { id: 'j2', name: 'Jane Doe' },
    ],
    teams,
  };
}
