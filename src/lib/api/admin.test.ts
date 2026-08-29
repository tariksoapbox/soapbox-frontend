import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createTeam,
  createUser,
  deleteTeam,
  deleteUser,
  getScoreMatrix,
  listTeams,
  listUsers,
  saveCriterionScores,
  setRunTime,
  setUserActive,
  updateTeam,
  updateUser,
} from './admin';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({ users: [], teams: [], team: {}, user: {}, judges: [], scores: [] }),
  } as unknown as Response);
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

/** The [url, init] pair of the single call the case made. */
function call(): [string, RequestInit] {
  return fetchMock.mock.calls[0] as [string, RequestInit];
}

describe('admin client', () => {
  it.each([
    ['lists users', () => listUsers(), '/api/admin/users', undefined],
    ['lists teams', () => listTeams(), '/api/teams', undefined],
    ['reads the matrix', () => getScoreMatrix(), '/api/admin/scores', undefined],
    ['deletes a user', () => deleteUser('u1'), '/api/admin/users/u1', 'DELETE'],
    ['deletes a team', () => deleteTeam('t1'), '/api/admin/teams/t1', 'DELETE'],
  ])('%s', async (_label, run, url, method) => {
    await run();
    const [calledUrl, init] = call();
    expect(calledUrl).toBe(url);
    expect(init.method).toBe(method);
  });

  it('creates a user', async () => {
    await createUser({ username: 'admin2', password: 'x', displayName: 'Drugi' });
    const [url, init] = call();
    expect(url).toBe('/api/admin/users');
    expect(init.method).toBe('POST');
  });

  it('patches an account with whatever changed', async () => {
    await updateUser('u1', { displayName: 'Sudija Jedan', username: 'sudija.jedan' });
    const [url, init] = call();
    expect(url).toBe('/api/admin/users/u1');
    expect(init.body).toBe('{"displayName":"Sudija Jedan","username":"sudija.jedan"}');
  });

  it('exposes the active toggle as a one-field patch', async () => {
    await setUserActive('u1', false);
    expect(call()[1].body).toBe('{"isActive":false}');
  });

  it('creates and patches a team', async () => {
    await createTeam({ name: 'Una Kayak', bibNumber: null });
    expect(call()[1].body).toBe('{"name":"Una Kayak","bibNumber":null}');
    fetchMock.mockClear();
    await updateTeam('t1', { name: 'Novo' });
    expect(call()[0]).toBe('/api/admin/teams/t1');
  });

  it('saves a whole criterion in one PUT', async () => {
    await saveCriterionScores('t1', 'vehicle', [
      { judgeId: 'j1', points: 9 },
      { judgeId: 'j2', points: null },
    ]);
    const [url, init] = call();
    expect(url).toBe('/api/admin/scores/t1/vehicle');
    expect(init.method).toBe('PUT');
    // `null` clears a mark back to blank rather than setting a zero.
    expect(init.body).toBe(
      '{"scores":[{"judgeId":"j1","points":9},{"judgeId":"j2","points":null}]}',
    );
  });

  it('PUTs the run time, and sends null to clear it', async () => {
    await setRunTime('t1', '1:57.42');
    expect(call()).toEqual([
      '/api/admin/teams/t1/run-time',
      expect.objectContaining({ method: 'PUT' }),
    ]);
    expect(call()[1].body).toBe('{"runTime":"1:57.42"}');
    fetchMock.mockClear();
    await setRunTime('t1', null);
    expect(call()[1].body).toBe('{"runTime":null}');
  });
});
