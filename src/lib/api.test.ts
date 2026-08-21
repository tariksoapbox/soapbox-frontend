import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, apiDelete, apiFetch, apiPatch, apiPost, apiPut, isUnauthenticated } from './api';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

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
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response);
    const error = (await apiFetch('/standings').catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(502);
    expect(error.message).toContain('502');
    expect(error.code).toBeUndefined();
  });

  it('ignores a non-string error field', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 42, code: 7 }, 400));
    const error = (await apiFetch('/x').catch((e: unknown) => e)) as ApiError;
    expect(error.message).toContain('400');
    expect(error.code).toBeUndefined();
  });

  it('turns a dead network into a readable message rather than "Failed to fetch"', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
    const error = (await apiFetch('/standings').catch((e: unknown) => e)) as ApiError;
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

describe('isUnauthenticated', () => {
  it('recognises only a 401', () => {
    expect(isUnauthenticated(new ApiError(401, 'Niste prijavljeni.'))).toBe(true);
    expect(isUnauthenticated(new ApiError(403, 'Nemate ovlaštenje.'))).toBe(false);
    expect(isUnauthenticated(new Error('boom'))).toBe(false);
  });
});
