import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { ScoresTab } from './ScoresTab';
import { score, team, user } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

const judges = [
  { id: 'u1', username: 'sudija1', displayName: 'Sudija 1', isActive: true },
  { id: 'u2', username: 'sudija2', displayName: 'Sudija 2', isActive: true },
];

function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<ScoresTab />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('ScoresTab', () => {
  it('shows a grid per criterion, judge by judge', async () => {
    setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': { judges, scores: [score()] },
    });
    expect(await screen.findByText('Kreativnost izrade vozila')).toBeInTheDocument();
    expect(screen.getByText('Kreativnost nastupa')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader', { name: 'Sudija 1' })).toHaveLength(2);
  });

  it('names the judge a stalled column is waiting on', async () => {
    setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': { judges, scores: [score()] },
    });
    await screen.findByText('Kreativnost izrade vozila');
    // Sudija 1 has voted on vehicle; the other three cells are still open.
    expect(screen.getAllByText('Čeka')).toHaveLength(3);
    // The cast 9 shows in its cell and again in the row total.
    expect(screen.getAllByText('9')).toHaveLength(2);
  });

  it('totals each row so the column value is checkable by eye', async () => {
    setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': {
        judges,
        scores: [score(), score({ id: 's2', judgeId: 'u2', points: 8 })],
      },
    });
    await screen.findByText('Kreativnost izrade vozila');
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('leaves a deactivated judge out of the grid entirely', async () => {
    setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': {
        judges: [
          ...judges,
          { ...user({ id: 'u3', displayName: 'Bivši Sudija' }), isActive: false },
        ],
        scores: [],
      },
    });
    await screen.findByText('Kreativnost izrade vozila');
    expect(screen.queryByRole('columnheader', { name: 'Bivši Sudija' })).not.toBeInTheDocument();
  });

  it('clears a mis-tapped vote after spelling out what happens', async () => {
    const { api } = setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': { judges, scores: [score()] },
      'DELETE /admin/scores/s1': { status: 204 },
    });
    await screen.findByText('Kreativnost izrade vozila');
    await userEvent.click(
      screen.getByRole('button', { name: /Poništi ocjenu — Sudija 1, Leteći Bosanci/ }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/moći poslati ponovo/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Poništi ocjenu' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'DELETE')).toBe(true));
  });

  it('points an admin at the Users tab when there are no judges', async () => {
    setup({ 'GET /teams': { teams: [team()] }, 'GET /admin/scores': { judges: [], scores: [] } });
    expect(await screen.findByText(/Nema aktivnih sudija/)).toBeInTheDocument();
  });

  it('says so when there are no teams', async () => {
    setup({ 'GET /teams': { teams: [] }, 'GET /admin/scores': { judges, scores: [] } });
    expect(await screen.findByText('Još nema ekipa.')).toBeInTheDocument();
  });

  it('shows the start number next to the team', async () => {
    setup({
      'GET /teams': { teams: [team(), team({ id: 't2', name: 'Bez Broja', bibNumber: null })] },
      'GET /admin/scores': { judges, scores: [] },
    });
    await screen.findByText('Kreativnost izrade vozila');
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bez Broja')).toHaveLength(2);
  });

  it('backs out of clearing a vote', async () => {
    const { api } = setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': { judges, scores: [score()] },
    });
    await screen.findByText('Kreativnost izrade vozila');
    await userEvent.click(
      screen.getByRole('button', { name: /Poništi ocjenu — Sudija 1, Leteći Bosanci/ }),
    );
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('retries a failed load', async () => {
    const { api } = setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    await screen.findByRole('alert');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });

  it('reports a failed load', async () => {
    setup({
      'GET /teams': { teams: [team()] },
      'GET /admin/scores': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
  });
});
