import { apiFetch, apiPost } from '../api';
import type { Ballot, Criterion } from '@/schemas/contracts';

export const getBallot = () => apiFetch<Ballot>('/judge/ballot');

export interface SubmitScoreInput {
  teamId: string;
  criterion: Criterion;
  points: number;
}

export const submitScore = (input: SubmitScoreInput) =>
  apiPost<{ teamId: string; criterion: Criterion; points: number; submittedAt: string }>(
    '/judge/scores',
    input,
  );
