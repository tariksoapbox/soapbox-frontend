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

  it('shows when the board was computed, so a frozen screen is detectable', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('calls the results final only when every row is settled', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    expect(await screen.findByText('Konačni rezultati')).toBeInTheDocument();
  });

  it('labels a board still in progress as provisional', async () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam({ final: false })]) });
    await screen.findByText('Leteći Bosanci');
    expect(screen.queryByText('Konačni rezultati')).not.toBeInTheDocument();
    expect(screen.getAllByText('Privremeno').length).toBeGreaterThan(0);
  });

  it('waits gracefully before the first response', () => {
    setup({ 'GET /public/standings': publicStandings([publicTeam()]) });
    expect(screen.getByRole('status')).toHaveTextContent('Rezultati se učitavaju');
  });

  it('says so when the race has not started', async () => {
    setup({ 'GET /public/standings': publicStandings([]) });
    expect(await screen.findByText('Utrka još nije počela.')).toBeInTheDocument();
  });

  it('reports a total failure to load', async () => {
    setup({ 'GET /public/standings': { status: 500, body: { error: 'nope' } } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Nema veze sa serverom');
  });
});
