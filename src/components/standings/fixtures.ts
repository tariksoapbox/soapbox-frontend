import type { Standings, TeamStanding } from '@/schemas/contracts';

/** A team row with everything settled; override any part of it per test. */
export function teamStanding(overrides: Partial<TeamStanding> = {}): TeamStanding {
  return {
    id: 't1',
    name: 'Leteći Bosanci',
    bibNumber: 1,
    vehicle: { total: 45, judges: 5, rank: 2, complete: true },
    performance: { total: 43, judges: 5, rank: 2, complete: true },
    time: { ms: 117_200, formatted: '1:57.20', rank: 1 },
    placementSum: 5,
    overallRank: 1,
    final: true,
    ...overrides,
  };
}

export function standingsFixture(
  teams: TeamStanding[],
  overrides: Partial<Standings> = {},
): Standings {
  return {
    expectedJudges: 5,
    eventComplete: teams.length > 0 && teams.every((t) => t.final),
    teams,
    computedAt: '2026-08-21T10:04:05.000Z',
    ...overrides,
  };
}
