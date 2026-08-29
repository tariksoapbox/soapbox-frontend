/**
 * The API's response shapes. Duplicated from `soapbox-backend/src/` for now —
 * the backend copy is authoritative. When the entities stop moving, extract
 * both into a shared `@soapbox/contracts` package.
 */
export const CRITERIA = ['vehicle', 'performance'] as const;
export type Criterion = (typeof CRITERIA)[number];

/** Everyone who can sign in is an administrator; there is no role. */
export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * A judge is a name on the panel. They never sign in — they score on paper and
 * the admin types the numbers in — so there is no username and no password.
 */
export interface Judge {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  bibNumber: number | null;
  runTimeMs: number | null;
  runTime: string | null;
  runTimeSetAt?: string | null;
}

export interface CriterionStanding {
  total: number;
  judges: number;
  rank: number | null;
  complete: boolean;
}

export interface TimeStanding {
  ms: number | null;
  formatted: string | null;
  rank: number | null;
}

export interface TeamStanding {
  id: string;
  name: string;
  bibNumber: number | null;
  vehicle: CriterionStanding;
  performance: CriterionStanding;
  time: TimeStanding;
  /** The three places added up — smaller is better. Null while any is missing. */
  placementSum: number | null;
  overallRank: number | null;
  final: boolean;
}

export interface Standings {
  expectedJudges: number;
  eventComplete: boolean;
  teams: TeamStanding[];
  computedAt: string;
}

/**
 * A key another app uses to read the board. The key itself is only ever in the
 * response that created it — this is what survives afterwards.
 */
export interface ApiKey {
  id: string;
  name: string;
  /** The visible head, e.g. `sbx_9f3a2b1c`, for telling two keys apart. */
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

/** One judge's mark for one team and criterion. A missing entry is a blank. */
export interface ScoreEntry {
  teamId: string;
  judgeId: string;
  criterion: Criterion;
  points: number;
}

export interface ScoreMatrix {
  judges: { id: string; name: string; isActive: boolean }[];
  scores: ScoreEntry[];
}
