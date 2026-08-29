import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ApiError,
  apiDelete,
  apiFetch,
  apiPatch,
  apiPost,
  apiPut,
  isUnauthenticated,
  isUpstreamUnavailable,
  onBackendWaking,
} from './api';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/**
 * Run `fn` with timers faked, skipping each retry's backoff as it is scheduled
 * — so a test covering the full 75s wake window finishes in milliseconds.
 * Stops advancing the moment the call settles, rather than draining a fixed
 * number of rounds (which would keep firing timers past the result).
 */
async function withFastRetries<T>(fn: () => Promise<T>): Promise<T> {
  vi.useFakeTimers();
  let settled = false;
  const promise = fn().finally(() => {
    settled = true;
  });
  while (!settled) {
    await vi.advanceTimersByTimeAsync(2_500);
  }
  return promise;
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

describe('apiFetch', () => {
  it('prefixes the base URL and always sends the session cookie', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    await expect(apiFetch('/standings')).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/standings');
    expect(init.credentials).toBe('include');
  });

  it('returns nothing for a 204', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 } as Response);
    await expect(apiFetch('/admin/scores/s1')).resolves.toBeUndefined();
  });

  it("surfaces the API's own Bosnian message and code", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Već ste poslali ocjenu.', code: 'ALREADY_SUBMITTED' }, 409),
    );
    const error = (await apiFetch('/judge/scores').catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(409);
    expect(error.message).toBe('Već ste poslali ocjenu.');
    expect(error.code).toBe('ALREADY_SUBMITTED');
  });

  it('falls back when the error body is not the API shape', async () => {
    // 500, not 502: a 502 means the backend was unreachable and is retried
    // (see "waking a sleeping backend"), which is a different behaviour.
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);
    const error = (await apiFetch('/standings').catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(500);
    expect(error.message).toContain('500');
    expect(error.code).toBeUndefined();
  });

  it('ignores a non-string error field', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 42, code: 7 }, 400));
    const error = (await apiFetch('/x').catch((e: unknown) => e)) as ApiError;
    expect(error.message).toContain('400');
    expect(error.code).toBeUndefined();
  });

  it('turns a dead network into a readable message rather than "Failed to fetch"', async () => {
    // Retried first (it looks identical to a sleeping backend); this is the
    // message once the wake window has passed and it really is offline.
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
    const error = (await withFastRetries(() =>
      apiFetch('/standings').catch((e: unknown) => e),
    )) as ApiError;
    expect(error.status).toBe(0);
    expect(error.message).toContain('Nema veze sa serverom');
  });
});

describe('verb helpers', () => {
  beforeEach(() => fetchMock.mockResolvedValue(jsonResponse({})));

  it.each([
    ['POST', () => apiPost('/a', { x: 1 }), '{"x":1}'],
    ['PATCH', () => apiPatch('/a', { x: 1 }), '{"x":1}'],
    ['PUT', () => apiPut('/a', { x: 1 }), '{"x":1}'],
  ])('sends %s with a JSON body', async (method, call, body) => {
    await call();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe(method);
    expect(init.body).toBe(body);
  });

  it('POSTs an empty object when there is nothing to send', async () => {
    await apiPost('/auth/logout');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('{}');
  });

  it('sends DELETE with no body', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 } as Response);
    await apiDelete('/admin/teams/t1');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('DELETE');
    expect(init.body).toBeUndefined();
  });
});

describe('waking a sleeping backend', () => {
  it.each([502, 503, 504])('retries a %i until the backend answers', async (status) => {
    // Render's free instance spins down after ~15 min; the first request gets a
    // 502 from the proxy while it boots. That is a wait, not a failure.
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: 'Bad gateway' }, status))
      .mockResolvedValueOnce(jsonResponse({ user: { username: 'admin' } }));

    await expect(withFastRetries(() => apiFetch('/auth/session'))).resolves.toEqual({
      user: { username: 'admin' },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a POST too, because the request never reached the app', async () => {
    // A 502 comes from the proxy failing to connect, so nothing ran — and
    // login is the request most likely to be the one that wakes the backend.
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 502))
      .mockResolvedValueOnce(jsonResponse({ user: { username: 'admin' } }));

    await expect(
      withFastRetries(() => apiPost('/auth/login', { username: 'admin' })),
    ).resolves.toEqual({
      user: { username: 'admin' },
    });
  });

  it('retries when fetch itself never gets a response', async () => {
    fetchMock
      .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    await expect(withFastRetries(() => apiFetch('/standings'))).resolves.toEqual({ ok: true });
  });

  it('gives up once the wake window has passed', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 502));
    const error = (await withFastRetries(() =>
      apiFetch('/standings').catch((e: unknown) => e),
    )) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
  });

  it('never retries an answer the API produced itself', async () => {
    // A 500 from our own error handler means the request DID run. Repeating it
    // would just run it again, and could duplicate a write.
    for (const status of [400, 401, 403, 404, 409, 500]) {
      fetchMock.mockReset().mockResolvedValue(jsonResponse({ error: 'nope' }, status));
      await expect(apiFetch('/x')).rejects.toBeInstanceOf(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
  });

  it('tells listeners while it waits, and again when it stops', async () => {
    const seen: boolean[] = [];
    const off = onBackendWaking((w) => seen.push(w));
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 502))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    await withFastRetries(() => apiFetch('/standings'));
    off();
    // A judge watching a disabled button needs to know something is happening.
    expect(seen).toEqual([true, false]);
  });

  it('stays quiet when the first attempt succeeds', async () => {
    const seen: boolean[] = [];
    const off = onBackendWaking((w) => seen.push(w));
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    await apiFetch('/standings');
    off();
    expect(seen).toEqual([]);
  });
});

describe('isUpstreamUnavailable', () => {
  it('recognises an unreachable backend, and nothing else', () => {
    for (const status of [0, 502, 503, 504]) {
      expect(isUpstreamUnavailable(new ApiError(status, 'x'))).toBe(true);
    }
    for (const status of [400, 401, 409, 500]) {
      expect(isUpstreamUnavailable(new ApiError(status, 'x'))).toBe(false);
    }
    expect(isUpstreamUnavailable(new Error('boom'))).toBe(false);
  });
});

describe('isUnauthenticated', () => {
  it('recognises only a 401', () => {
    expect(isUnauthenticated(new ApiError(401, 'Niste prijavljeni.'))).toBe(true);
    expect(isUnauthenticated(new ApiError(403, 'Nemate ovlaštenje.'))).toBe(false);
    expect(isUnauthenticated(new Error('boom'))).toBe(false);
  });
});
