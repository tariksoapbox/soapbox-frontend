import { apiDelete, apiFetch, apiPatch, apiPost } from '../api';
import type { Judge } from '@/schemas/contracts';

/**
 * The panel. A judge is a name — no username, no password, no session — so
 * these are the only four things you can do to one.
 */
export const listJudges = () =>
  apiFetch<{ judges: Judge[] }>('/admin/judges').then((r) => r.judges);

export const createJudge = (name: string) =>
  apiPost<{ judge: Judge }>('/admin/judges', { name }).then((r) => r.judge);

export const updateJudge = (id: string, patch: { name?: string; isActive?: boolean }) =>
  apiPatch<{ judge: Judge }>(`/admin/judges/${id}`, patch).then((r) => r.judge);

/** Cascades to every mark recorded for them — rename instead where you can. */
export const deleteJudge = (id: string) => apiDelete(`/admin/judges/${id}`);
