/**
 * The API's response shapes. Duplicated from `soapbox-backend/src/` for now —
 * the backend copy is authoritative. When the entities stop moving, extract
 * both into a shared `@soapbox/contracts` package.
 */
export const ROLES = ['admin', 'referee'] as const;
export type Role = (typeof ROLES)[number];

export const CRITERIA = ['vehicle', 'performance'] as const;
export type Criterion = (typeof CRITERIA)[number];

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
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

export interface BallotCell {
  points: number | null;
  submittedAt: string | null;
}

export interface BallotTeam {
  id: string;
  name: string;
  bibNumber: number | null;
  vehicle: BallotCell;
  performance: BallotCell;
}

export interface Ballot {
  teams: BallotTeam[];
  /** Cells this judge has not cast yet, across every team and both criteria. */
  remaining: number;
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

export interface ScoreEntry {
  id: string;
  teamId: string;
  judgeId: string;
  criterion: Criterion;
  points: number;
  submittedAt: string;
}

export interface ScoreMatrix {
  judges: { id: string; username: string; displayName: string; isActive: boolean }[];
  scores: ScoreEntry[];
}
