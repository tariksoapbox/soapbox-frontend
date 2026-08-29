import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { AdminConsole } from './AdminConsole';
import { mockApi } from '@/lib/queries/test-server';
import { standingsFixture, teamStanding } from '../standings/fixtures';
import { judge, team, user } from './fixtures';

function setup() {
  const api = mockApi({
    'GET /standings': standingsFixture([teamStanding()]),
    'GET /teams': { teams: [team()] },
    'GET /admin/users': { users: [user()] },
    'GET /admin/scores': {
      judges: [{ id: 'j1', name: 'Buba Corelli', isActive: true }],
      scores: [],
    },
    'GET /admin/judges': { judges: [judge()] },
    'GET /auth/session': { user: user() },
  });
  return { api, ...renderWithProviders(<AdminConsole />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('AdminConsole', () => {
  it('opens on the board', async () => {
    setup();
    expect(screen.getByRole('tab', { name: 'Rang lista', selected: true })).toBeInTheDocument();
    expect(await screen.findByText('Leteći Bosanci')).toBeInTheDocument();
  });

  it('reaches every capability the brief asks an admin for', async () => {
    setup();
    for (const [tab, marker] of [
      ['Ekipe', 'Dodaj ekipu'],
      ['Ocjene', 'Kreativnost izrade vozila'],
      ['Sudije', 'Dodaj sudiju'],
      ['Administratori', 'Novi administrator'],
    ] as const) {
      await userEvent.click(screen.getByRole('tab', { name: tab }));
      expect(await screen.findAllByText(marker)).not.toHaveLength(0);
    }
  });

  it('mounts only the visible tab, so background tabs do not poll', async () => {
    const { api } = setup();
    await screen.findByText('Leteći Bosanci');
    expect(api.calls.some((c) => c.path === '/admin/users')).toBe(false);
    await userEvent.click(screen.getByRole('tab', { name: 'Administratori' }));
    expect(await screen.findByText('Novi administrator')).toBeInTheDocument();
  });
});
