import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSession, login, logout } from './auth';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const json = (body: unknown, status = 200) =>
  ({ ok: status < 400, status, json: () => Promise.resolve(body) }) as unknown as Response;

const user = { id: 'u1', username: 'admin', displayName: 'A', role: 'admin' as const };

describe('auth client', () => {
  it('unwraps the user from a sign-in', async () => {
    fetchMock.mockResolvedValue(json({ user }));
    await expect(login({ username: 'admin', password: 'x' })).resolves.toEqual(user);
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('/api/auth/login');
  });

  it('signs out', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204 } as Response);
    await expect(logout()).resolves.toBeUndefined();
  });

  it('reports a signed-out visitor as null rather than throwing', async () => {
    fetchMock.mockResolvedValue(json({ user: null }));
    await expect(getSession()).resolves.toBeNull();
  });
});
