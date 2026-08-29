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

/**
 * The API is unreachable — asleep, restarting, or briefly unroutable.
 *
 * `0` is our own marker for "fetch itself threw" (no response at all); 502/503/
 * 504 come from the proxy in front of a backend it could not reach. In every
 * case the request never ran, so repeating it is safe.
 */
export function isUpstreamUnavailable(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 0 || [502, 503, 504].includes(error.status))
  );
}

/** How long to keep retrying a sleeping backend, and how long to wait between tries. */
const WAKE_TIMEOUT_MS = 75_000;
const WAKE_RETRY_DELAY_MS = 2_500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Called while a request is waiting on a sleeping backend, so a view can say
 * so instead of appearing frozen for half a minute.
 */
export type WakeListener = (waking: boolean) => void;

const wakeListeners = new Set<WakeListener>();

export function onBackendWaking(listener: WakeListener): () => void {
  wakeListeners.add(listener);
  return () => wakeListeners.delete(listener);
}

function announceWaking(waking: boolean): void {
  for (const listener of wakeListeners) listener(waking);
}

/** One attempt. Throws `ApiError`; `status: 0` means no response at all. */
async function attempt<T>(path: string, init?: RequestInit): Promise<T> {
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

/**
 * Every call goes through here, so waking a sleeping backend is handled once.
 *
 * Render's free instance spins down after about 15 minutes and takes ~20-50s to
 * come back; the first request to reach it gets a 502 from the proxy. That is
 * not a failure worth showing a judge mid-event — it is a wait. So an
 * unreachable backend is retried until `WAKE_TIMEOUT_MS`, and views are told
 * (`onBackendWaking`) so the delay is explained rather than silent.
 *
 * Retrying is safe for every method here because the request never reached the
 * app: a 502/503/504 comes from the proxy failing to connect, and `status: 0`
 * means fetch itself never got a response. Anything the API *did* answer —
 * including every 4xx and 5xx it generates itself — is returned untouched.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const deadline = Date.now() + WAKE_TIMEOUT_MS;
  let announced = false;
  try {
    for (;;) {
      try {
        return await attempt<T>(path, init);
      } catch (error) {
        if (!isUpstreamUnavailable(error) || Date.now() + WAKE_RETRY_DELAY_MS >= deadline) {
          throw error;
        }
        if (!announced) {
          announced = true;
          announceWaking(true);
        }
        await sleep(WAKE_RETRY_DELAY_MS);
      }
    }
  } finally {
    if (announced) announceWaking(false);
  }
}

export const apiPost = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) });

export const apiPatch = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiDelete = (path: string) => apiFetch<void>(path, { method: 'DELETE' });
