import { apiDelete, apiFetch, apiPatch, apiPost, apiPut } from '../api';
import type { AdminUser, Criterion, ScoreMatrix, Team } from '@/schemas/contracts';

/* ---------------------------------------------------------------- users --- */

export const listUsers = () =>
  apiFetch<{ users: AdminUser[] }>('/admin/users').then((r) => r.users);

export interface CreateUserInput {
  username: string;
  password: string;
  displayName: string;
}

export const createUser = (input: CreateUserInput) =>
  apiPost<{ user: AdminUser }>('/admin/users', input).then((r) => r.user);

/**
 * Edit an account — any subset of the fields. Safe by design: `score.judge_id`
 * references the user's UUID, which never changes, so a correction keeps every
 * vote that judge has already cast. (Deleting them would not.)
 */
export interface UpdateUserInput {
  displayName?: string;
  username?: string;
  isActive?: boolean;
  /** Omit to keep the current password. */
  password?: string;
}

export const updateUser = (id: string, patch: UpdateUserInput) =>
  apiPatch<{ user: AdminUser }>(`/admin/users/${id}`, patch).then((r) => r.user);

/** Shorthand for the row's activate/deactivate button. */
export const setUserActive = (id: string, isActive: boolean) => updateUser(id, { isActive });

export const deleteUser = (id: string) => apiDelete(`/admin/users/${id}`);

/* ---------------------------------------------------------------- teams --- */

export const listTeams = () => apiFetch<{ teams: Team[] }>('/teams').then((r) => r.teams);

export interface TeamInput {
  name: string;
  bibNumber: number | null;
}

export const createTeam = (input: TeamInput) =>
  apiPost<{ team: Team }>('/admin/teams', input).then((r) => r.team);

export const updateTeam = (id: string, patch: Partial<TeamInput>) =>
  apiPatch<{ team: Team }>(`/admin/teams/${id}`, patch).then((r) => r.team);

/** `null` clears a time entered by mistake. */
export const setRunTime = (id: string, runTime: string | null) =>
  apiPut<{ team: Team }>(`/admin/teams/${id}/run-time`, { runTime }).then((r) => r.team);

export const deleteTeam = (id: string) => apiDelete(`/admin/teams/${id}`);

/* --------------------------------------------------------------- scores --- */

export const getScoreMatrix = () => apiFetch<ScoreMatrix>('/admin/scores');

/** `null` clears that judge's mark back to blank rather than setting a zero. */
export interface CriterionScore {
  judgeId: string;
  points: number | null;
}

/**
 * Save one criterion for one team — the whole panel in a single write, which is
 * how the scores actually arrive: a stack of cards for one run. Re-saving is
 * how a correction is made.
 */
export const saveCriterionScores = (
  teamId: string,
  criterion: Criterion,
  scores: CriterionScore[],
) => apiPut<void>(`/admin/scores/${teamId}/${criterion}`, { scores });
