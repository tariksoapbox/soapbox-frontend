'use client';

import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import {
  createTeam,
  createUser,
  deleteTeam,
  deleteUser,
  getScoreMatrix,
  listTeams,
  saveCriterionScores,
  listUsers,
  setRunTime,
  setUserActive,
  updateTeam,
  updateUser,
  type CriterionScore,
  type TeamInput,
  type UpdateUserInput,
} from '@/lib/api/admin';
import { createJudge, deleteJudge, listJudges, updateJudge } from '@/lib/api/judges';
import type { Criterion } from '@/schemas/contracts';
import { queryKeys, LIVE_REFETCH_MS } from './keys';

/* ---------------------------------------------------------------- reads --- */

export function useTeams() {
  return useQuery({ queryKey: queryKeys.teams, queryFn: listTeams });
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
}

export function useJudges() {
  return useQuery({ queryKey: queryKeys.judges, queryFn: listJudges });
}

/** Who has voted and who has not — the admin's live view of a stalled column. */
export function useScoreMatrix() {
  return useQuery({
    queryKey: queryKeys.scoreMatrix,
    queryFn: getScoreMatrix,
    refetchInterval: LIVE_REFETCH_MS,
    placeholderData: (previous) => previous,
  });
}

/* ------------------------------------------------------------- mutations --- */

/**
 * Every admin write moves the board, so each one invalidates the standings
 * alongside its own list. Keeping that in one helper is what stops a new
 * mutation from quietly shipping without it.
 */
function useAdminMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  ...keys: QueryKey[]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      for (const key of [...keys, queryKeys.standings]) {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

export const useCreateTeam = () => useAdminMutation(createTeam, queryKeys.teams);

export const useUpdateTeam = () =>
  useAdminMutation(
    ({ id, patch }: { id: string; patch: Partial<TeamInput> }) => updateTeam(id, patch),
    queryKeys.teams,
  );

export const useSetRunTime = () =>
  useAdminMutation(
    ({ id, runTime }: { id: string; runTime: string | null }) => setRunTime(id, runTime),
    queryKeys.teams,
  );

// Deleting a team cascades to its scores, so the matrix has to go too.
export const useDeleteTeam = () =>
  useAdminMutation(deleteTeam, queryKeys.teams, queryKeys.scoreMatrix);

export const useCreateUser = () =>
  useAdminMutation(createUser, queryKeys.users, queryKeys.scoreMatrix);

/**
 * A role or active-state change moves `expectedJudges`, which re-rates every
 * column; a rename changes the name shown against every cell in the matrix.
 *
 * `session` is invalidated too, because an admin editing their **own** row has
 * just changed the copy of themselves the header renders — and if they changed
 * their own password, the API has revoked their session and the refetch is what
 * discovers it and sends them back to sign in.
 */
export const useUpdateUser = () =>
  useAdminMutation(
    ({ id, patch }: { id: string; patch: UpdateUserInput }) => updateUser(id, patch),
    queryKeys.users,
    queryKeys.scoreMatrix,
    queryKeys.session,
  );

export const useSetUserActive = () =>
  useAdminMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) => setUserActive(id, isActive),
    queryKeys.users,
    queryKeys.scoreMatrix,
  );

export const useDeleteUser = () =>
  useAdminMutation(deleteUser, queryKeys.users, queryKeys.scoreMatrix);

/**
 * Saving a criterion moves the totals, so the board and the grid both refresh.
 */
export const useSaveCriterionScores = () =>
  useAdminMutation(
    ({
      teamId,
      criterion,
      scores,
    }: {
      teamId: string;
      criterion: Criterion;
      scores: CriterionScore[];
    }) => saveCriterionScores(teamId, criterion, scores),
    queryKeys.scoreMatrix,
  );

export const useCreateJudge = () =>
  useAdminMutation(createJudge, queryKeys.judges, queryKeys.scoreMatrix);

// A rename shows up against every mark; taking a judge off the panel moves
// `expectedJudges`, which re-rates every column.
export const useUpdateJudge = () =>
  useAdminMutation(
    ({ id, patch }: { id: string; patch: { name?: string; isActive?: boolean } }) =>
      updateJudge(id, patch),
    queryKeys.judges,
    queryKeys.scoreMatrix,
  );

export const useDeleteJudge = () =>
  useAdminMutation(deleteJudge, queryKeys.judges, queryKeys.scoreMatrix);
