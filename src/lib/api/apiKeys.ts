import { apiDelete, apiFetch, apiPost } from '../api';
import type { ApiKey } from '@/schemas/contracts';

export const listApiKeys = () =>
  apiFetch<{ keys: ApiKey[] }>('/admin/api-keys').then((r) => r.keys);

/**
 * Mint a key. `secret` is the plaintext and appears **only here** — the server
 * stores a hash, so it cannot be fetched again. The caller must show it to the
 * admin immediately.
 */
export const createApiKey = (name: string) =>
  apiPost<{ key: ApiKey; secret: string }>('/admin/api-keys', { name });

/** Revoke: the key stops working at once, but stays on the list as history. */
export const revokeApiKey = (id: string) => apiDelete(`/admin/api-keys/${id}`) as Promise<void>;
