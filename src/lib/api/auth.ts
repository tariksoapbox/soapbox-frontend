import { apiFetch, apiPost } from '../api';
import type { SessionUser } from '@/schemas/contracts';
import type { LoginForm } from '@/schemas/forms';

export const login = (input: LoginForm) =>
  apiPost<{ user: SessionUser }>('/auth/login', input).then((r) => r.user);

export const logout = () => apiPost<void>('/auth/logout');

/** Always resolves: `null` means signed out, which is a normal state, not an error. */
export const getSession = () =>
  apiFetch<{ user: SessionUser | null }>('/auth/session').then((r) => r.user);
