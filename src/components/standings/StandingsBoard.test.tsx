import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { StandingsBoard } from './StandingsBoard';
import { standingsFixture, teamStanding } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

// jsdom reports every media query as false, so the board renders its card
// layout here; the table is covered directly in StandingsTable.test.
function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<StandingsBoard />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('StandingsBoard', () => {
  it('shows the board with the time it was computed and how many judges count', async () => {
    setup({ 'GET /standings': standingsFixture([teamStanding()]) });
    expect(await screen.findByText('Leteći Bosanci')).toBeInTheDocument();
    expect(screen.getByText('Uživo')).toBeInTheDocument();
    expect(screen.getByText(/Ažurirano u .* · 5 sudija/)).toBeInTheDocument();
  });

  it('explains the 1 + 1 + 1 = 3 rule to anyone reading the board cold', async () => {
    setup({ 'GET /standings': standingsFixture([teamStanding()]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.getByRole('region', { name: 'Kako se računa' })).toHaveTextContent(
      '1 + 1 + 1 = 3',
    );
  });

  it('announces a finished event', async () => {
    setup({ 'GET /standings': standingsFixture([teamStanding()]) });
    expect(
      await screen.findByText('Sve ocjene i sva vremena su uneseni. Rang lista je konačna.'),
    ).toBeInTheDocument();
  });

  it('stays quiet about being final while anything is outstanding', async () => {
    setup({ 'GET /standings': standingsFixture([teamStanding({ final: false })]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.queryByText(/Rang lista je konačna/)).not.toBeInTheDocument();
    expect(screen.getByText('Privremeno')).toBeInTheDocument();
  });

  it('says so when there are no teams yet', async () => {
    setup({ 'GET /standings': standingsFixture([]) });
    expect(await screen.findByText('Još nema ekipa.')).toBeInTheDocument();
  });

  it('reports a failed load and retries on demand', async () => {
    const { api } = setup({
      'GET /standings': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });

  it('renders the wide table when the viewport allows it', async () => {
    // jsdom answers every media query with false, so the table branch needs a
    // matchMedia that says "wide" to be reachable at all.
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );
    setup({ 'GET /standings': standingsFixture([teamStanding()]) });
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });
});
