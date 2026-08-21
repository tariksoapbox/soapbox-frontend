import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getStandings } from './standings';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('standings client', () => {
  it('fetches the board', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ teams: [] }),
    } as unknown as Response);
    await expect(getStandings()).resolves.toEqual({ teams: [] });
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe('/api/standings');
  });
});
