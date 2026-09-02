import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { PublicBoard } from './PublicBoard';
import { publicStandings, publicTeam } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<PublicBoard />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('PublicBoard', () => {
  it('reads the board without any key — this page is public', async () => {
    const { api } = setup({
      'GET /public/standings': publicStandings([publicTeam()]),
    });
    expect(await screen.findByText('Leteći Bosanci')).toBeInTheDocument();
    // The keyed endpoint would need a credential the browser cannot keep secret.
    expect(api.calls.every((c) => c.path === '/public/standings')).toBe(true);
  });

  it('renders one row per team, in the order the API ranked them', async () => {
    setup({
      'GET /public/standings': publicStandings([
        publicTeam({ id: 't1', name: 'Prva', rank: 1 }),
        publicTeam({ id: 't2', name: 'Druga', rank: 2, placementSum: 7 }),
      ]),
    });
    await screen.findByText('Prva');
    const rows = screen.getAllByTestId('board-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Prva');
    expect(rows[1]).toHaveTextContent('Druga');
  });

  it('carries no wordmark, status chip or timestamp — just the standings', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.queryByText('Soapbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Sistem bodovanja')).not.toBeInTheDocument();
    expect(screen.queryByText('Konačni rezultati')).not.toBeInTheDocument();
    // The bare clock read as a mystery number, so it is gone from the header.
    expect(screen.queryByText(/^\d{2}:\d{2}:\d{2}$/)).not.toBeInTheDocument();
    // And no per-row "Privremeno" either — the board shows standings, not
    // commentary on how settled each one is.
    expect(screen.queryByText(/Privremeno/)).not.toBeInTheDocument();
  });

  it('leads with the ranking itself', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rang lista');
  });

  it('renders the same rows in the white variant', async () => {
    // The variant is a palette swap, so the components must not change shape.
    // Which colours each palette supplies is asserted in theme.test.ts, where
    // the values are readable — a rendered element only reports the CSS
    // variable name, which is identical in both.
    mockApi({ 'GET /public/standings': publicStandings([publicTeam()]) });
    const { getAllByTestId, findByText } = renderWithProviders(<PublicBoard variant="light" />);
    await findByText('Leteći Bosanci');
    expect(getAllByTestId('board-row')).toHaveLength(1);
  });

  it('polls once a minute, not every few seconds', async () => {
    const { BOARD_REFETCH_MS } = await import('@/lib/queries/keys');
    // An audience screen is read, not operated; numbers twitching every three
    // seconds are harder to read than a board that settles.
    expect(BOARD_REFETCH_MS).toBe(60_000);
  });

  it('waits on a spinner alone, with no caption on screen', () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    const status = screen.getByRole('status');
    // Nothing visible but the spinner — the wording survives only as the
    // accessible name, for anyone who cannot see it turn.
    expect(status).toHaveTextContent('');
    expect(screen.getByLabelText('Rezultati se učitavaju…')).toBeInTheDocument();
  });

  it('says so when the race has not started', async () => {
    setup({ 'GET /public/standings': publicStandings([]) });
    expect(await screen.findByText('Utrka još nije počela.')).toBeInTheDocument();
  });

  it('reports a total failure to load', async () => {
    setup({ 'GET /public/standings': { status: 500, body: { error: 'nope' } } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Nema veze sa serverom');
  });

  it('wears the font class the page hands it', async () => {
    // The variables are declared by the server page, so if this class stops
    // reaching the board the whole thing silently falls back to Poppins.
    renderWithProviders(<PublicBoard fontClassName="rb-book rb-cond" />);
    const heading = await screen.findByRole('heading', { level: 1 });
    expect(heading.closest('.rb-book.rb-cond')).not.toBeNull();
  });
});
