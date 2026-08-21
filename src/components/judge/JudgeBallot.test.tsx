import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { JudgeBallot } from './JudgeBallot';
import { mockApi, type Routes } from '@/lib/queries/test-server';
import type { Ballot, BallotTeam } from '@/schemas/contracts';

function team(overrides: Partial<BallotTeam> = {}): BallotTeam {
  return {
    id: 't1',
    name: 'Leteći Bosanci',
    bibNumber: 1,
    vehicle: { points: null, submittedAt: null },
    performance: { points: null, submittedAt: null },
    ...overrides,
  };
}

const ballot = (teams: BallotTeam[]): Ballot => ({
  teams,
  remaining: teams.reduce(
    (n, t) => n + (t.vehicle.points === null ? 1 : 0) + (t.performance.points === null ? 1 : 0),
    0,
  ),
});

function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<JudgeBallot />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('JudgeBallot', () => {
  it('lists the teams with both criteria and how much is left to do', async () => {
    setup({ 'GET /judge/ballot': ballot([team()]) });
    expect(await screen.findByText('Leteći Bosanci')).toBeInTheDocument();
    expect(screen.getByText('Preostalo ocjena: 2')).toBeInTheDocument();
    expect(screen.getByText('Kreativnost izrade vozila')).toBeInTheDocument();
    expect(screen.getByText('Kreativnost nastupa')).toBeInTheDocument();
  });

  it('warns that a submitted score cannot be changed', async () => {
    setup({ 'GET /judge/ballot': ballot([team()]) });
    expect(await screen.findByText(/ne može mijenjati/)).toBeInTheDocument();
  });

  it('sends the chosen score for the right team and criterion', async () => {
    const { api } = setup({
      'GET /judge/ballot': ballot([team()]),
      'POST /judge/scores': { status: 201, body: { points: 9 } },
    });
    await screen.findByText('Leteći Bosanci');
    // Vehicle creativity is the first criterion on the card.
    await userEvent.click(screen.getAllByRole('radio', { name: '9' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji ocjenu 9' }));

    await waitFor(() =>
      expect(api.calls.some((c) => c.method === 'POST' && c.path === '/judge/scores')).toBe(true),
    );
    const post = api.calls.find((c) => c.method === 'POST')!;
    expect(post.body).toEqual({ teamId: 't1', criterion: 'vehicle', points: 9 });
  });

  it("surfaces the API's refusal on the cell it belongs to", async () => {
    setup({
      'GET /judge/ballot': ballot([team()]),
      'POST /judge/scores': {
        status: 409,
        body: { error: 'Već ste poslali ocjenu za ovaj kriterij.', code: 'ALREADY_SUBMITTED' },
      },
    });
    await screen.findByText('Leteći Bosanci');
    await userEvent.click(screen.getAllByRole('radio', { name: '9' })[0]!);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji ocjenu 9' }));
    expect(await screen.findByText('Već ste poslali ocjenu za ovaj kriterij.')).toBeInTheDocument();
  });

  it('defaults to the teams still waiting on this judge', async () => {
    setup({
      'GET /judge/ballot': ballot([
        team({
          id: 'done',
          name: 'Gotova Ekipa',
          vehicle: { points: 9, submittedAt: '2026-08-21T10:00:00Z' },
          performance: { points: 8, submittedAt: '2026-08-21T10:00:00Z' },
        }),
        team({ id: 'open', name: 'Otvorena Ekipa' }),
      ]),
    });
    expect(await screen.findByText('Otvorena Ekipa')).toBeInTheDocument();
    expect(screen.queryByText('Gotova Ekipa')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Sve ekipe' }));
    expect(screen.getByText('Gotova Ekipa')).toBeInTheDocument();
  });

  it('says so when everything has been sent', async () => {
    setup({
      'GET /judge/ballot': ballot([
        team({
          vehicle: { points: 9, submittedAt: '2026-08-21T10:00:00Z' },
          performance: { points: 8, submittedAt: '2026-08-21T10:00:00Z' },
        }),
      ]),
    });
    expect(await screen.findByText('Sve ocjene su poslane. Hvala!')).toBeInTheDocument();
    expect(screen.getByText('Nema više ekipa koje čekaju Vašu ocjenu.')).toBeInTheDocument();
    // The "cannot be changed" notice is gone too — nothing left to warn about.
    expect(screen.queryByText(/ne može mijenjati/)).not.toBeInTheDocument();
  });

  it('uses the singular when exactly one cell is left', async () => {
    setup({
      'GET /judge/ballot': ballot([
        team({ vehicle: { points: 9, submittedAt: '2026-08-21T10:00:00Z' } }),
      ]),
    });
    expect(await screen.findByText('Preostala 1 ocjena')).toBeInTheDocument();
  });

  it('explains an empty roster rather than showing a blank screen', async () => {
    setup({ 'GET /judge/ballot': ballot([]) });
    expect(
      await screen.findByText('Administrator još nije unio nijednu ekipu.'),
    ).toBeInTheDocument();
  });

  it('does not claim "all done" while the ballot is still loading', () => {
    // `remaining` defaults to 0 before the first response; the chip must wait
    // for real data rather than reading that as a finished ballot.
    mockApi({ 'GET /judge/ballot': ballot([team()]) });
    renderWithProviders(<JudgeBallot />);
    expect(screen.queryByText('Sve ocjene su poslane. Hvala!')).not.toBeInTheDocument();
  });

  it('reports a failed load and retries on demand', async () => {
    const { api } = setup({
      'GET /judge/ballot': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });
});
