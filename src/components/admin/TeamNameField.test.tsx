import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { TeamNameField } from './TeamNameField';
import { team } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<TeamNameField team={team()} />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('TeamNameField', () => {
  it('offers Save only once the name actually changed', async () => {
    setup({});
    expect(screen.queryByRole('button', { name: 'Spremi naziv' })).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Naziv ekipe'), '!');
    expect(screen.getByRole('button', { name: 'Spremi naziv' })).toBeEnabled();
  });

  it('renames the team', async () => {
    const { api } = setup({ 'PATCH /admin/teams/t1': { team: team({ name: 'Novo ime' }) } });
    const input = screen.getByLabelText('Naziv ekipe');
    await userEvent.clear(input);
    await userEvent.type(input, 'Novo ime');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi naziv' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'PATCH')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PATCH')!.body).toEqual({ name: 'Novo ime' });
  });

  it('will not save a name that is too short', async () => {
    const { api } = setup({});
    const input = screen.getByLabelText('Naziv ekipe');
    await userEvent.clear(input);
    await userEvent.type(input, 'A');
    expect(screen.getByRole('button', { name: 'Spremi naziv' })).toBeDisabled();
    expect(api.calls.some((c) => c.method === 'PATCH')).toBe(false);
  });

  it('puts the saved name back when the write is refused', async () => {
    setup({
      'PATCH /admin/teams/t1': { status: 409, body: { error: 'Sukob.', code: 'CONFLICT' } },
    });
    const input = screen.getByLabelText('Naziv ekipe');
    await userEvent.clear(input);
    await userEvent.type(input, 'Novo ime');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi naziv' }));
    // The field must never show a name the server did not accept.
    await waitFor(() => expect(input).toHaveValue('Leteći Bosanci'));
  });
});
