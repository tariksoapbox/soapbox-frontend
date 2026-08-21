import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { JudgeConsole } from './JudgeConsole';
import { mockApi } from '@/lib/queries/test-server';
import { standingsFixture, teamStanding } from '../standings/fixtures';

function setup() {
  const api = mockApi({
    'GET /judge/ballot': {
      teams: [
        {
          id: 't1',
          name: 'Leteći Bosanci',
          bibNumber: 1,
          vehicle: { points: null, submittedAt: null },
          performance: { points: null, submittedAt: null },
        },
      ],
      remaining: 2,
    },
    'GET /standings': standingsFixture([teamStanding()]),
  });
  return { api, ...renderWithProviders(<JudgeConsole />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('JudgeConsole', () => {
  it('opens on the ballot — the only thing a judge has to do', async () => {
    setup();
    expect(screen.getByRole('tab', { name: 'Glasanje', selected: true })).toBeInTheDocument();
    expect(await screen.findByText('Kreativnost izrade vozila')).toBeInTheDocument();
  });

  it('reaches the board from a tab, since the header carries no navigation', async () => {
    setup();
    await userEvent.click(screen.getByRole('tab', { name: 'Rang lista' }));
    expect(await screen.findByText('Uživo')).toBeInTheDocument();
  });

  it('mounts only the visible tab, so the hidden one does not poll', async () => {
    const { api } = setup();
    await screen.findByText('Kreativnost izrade vozila');
    expect(api.calls.some((c) => c.path === '/standings')).toBe(false);
    await userEvent.click(screen.getByRole('tab', { name: 'Rang lista' }));
    await screen.findByText('Uživo');
    expect(api.calls.some((c) => c.path === '/judge/ballot')).toBe(true);
  });
});
