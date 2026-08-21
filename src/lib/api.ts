import { API_BASE_URL } from './config';

/**
 * One wrapper for every call, so the base URL, cookie handling and error
 * shaping live in a single place. The API always answers a failure with
 * `{ error, code? }` and the message is already in Bosnian, so `ApiError.message`
 * is rendered to the user verbatim.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Machine-readable code, e.g. `ALREADY_SUBMITTED` — branch on this, not on text. */
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** True when the user is not (or no longer) signed in. */
export function isUnauthenticated(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      // The session cookie must ride along on every call.
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // A dead network reads identically to a sleeping free-tier backend; say so
    // rather than surfacing "Failed to fetch".
    throw new ApiError(0, 'Nema veze sa serverom. Provjerite internet i pokušajte ponovo.');
  }

  if (!res.ok) {
    let message = `Zahtjev nije uspio (${res.status}).`;
    let code: string | undefined;
    try {
      const body = (await res.json()) as { error?: unknown; code?: unknown };
      if (typeof body.error === 'string' && body.error) message = body.error;
      if (typeof body.code === 'string') code = body.code;
    } catch {
      // A non-JSON error body (a proxy's HTML 502, say) leaves the default.
    }
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiPost = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = (path: string) => apiFetch<void>(path, { method: 'DELETE' });
