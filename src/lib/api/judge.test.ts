import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBallot, submitScore } from './judge';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

const json = (body: unknown) =>
  ({ ok: true, status: 200, json: () => Promise.resolve(body) }) as unknown as Response;

describe('judge client', () => {
  it('fetches the ballot', async () => {
    fetchMock.mockResolvedValue(json({ teams: [], remaining: 0 }));
    await expect(getBallot()).resolves.toEqual({ teams: [], remaining: 0 });
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('/api/judge/ballot');
  });

  it('posts one score', async () => {
    fetchMock.mockResolvedValue(json({ points: 9 }));
    await submitScore({ teamId: 't1', criterion: 'vehicle', points: 9 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/judge/scores');
    expect(init.body).toBe('{"teamId":"t1","criterion":"vehicle","points":9}');
  });
});
