import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { RunTimeField } from './RunTimeField';
import { team } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

function setup(routes: Routes, props = team()) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<RunTimeField team={props} />) };
}

const field = () => screen.getByLabelText(/Prolazno vrijeme — Leteći Bosanci/);

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('RunTimeField', () => {
  it('shows the accepted formats up front', () => {
    setup({});
    expect(screen.getByText(/m:ss.SS/)).toBeInTheDocument();
  });

  it('saves a clock reading', async () => {
    const { api } = setup({
      'PUT /admin/teams/t1/run-time': { team: team({ runTime: '1:57.42' }) },
    });
    await userEvent.type(field(), '1:57.42');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi vrijeme' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'PUT')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PUT')!.body).toEqual({ runTime: '1:57.42' });
  });

  it('refuses to send a time it cannot parse', async () => {
    const { api } = setup({});
    await userEvent.type(field(), '2;32');
    // The admin learns about it while their eyes are still on the field.
    expect(screen.getByRole('button', { name: 'Spremi vrijeme' })).toBeDisabled();
    expect(api.calls.some((c) => c.method === 'PUT')).toBe(false);
  });

  it('offers Save only once the value actually changed', async () => {
    setup({}, team({ runTimeMs: 117_420, runTime: '1:57.42' }));
    expect(screen.queryByRole('button', { name: 'Spremi vrijeme' })).not.toBeInTheDocument();
    await userEvent.type(field(), '9');
    expect(screen.getByRole('button', { name: 'Spremi vrijeme' })).toBeInTheDocument();
  });

  it('clears a time entered by mistake', async () => {
    const { api } = setup(
      { 'PUT /admin/teams/t1/run-time': { team: team() } },
      team({ runTimeMs: 117_420, runTime: '1:57.42' }),
    );
    await userEvent.click(screen.getByRole('button', { name: /Obriši vrijeme/ }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'PUT')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PUT')!.body).toEqual({ runTime: null });
  });

  it('offers no Clear when there is nothing to clear', () => {
    setup({});
    expect(screen.queryByRole('button', { name: /Obriši vrijeme/ })).not.toBeInTheDocument();
  });

  it("surfaces the API's rejection on the field", async () => {
    setup({
      'PUT /admin/teams/t1/run-time': {
        status: 400,
        body: { error: 'Vrijeme je predugo (najviše 60 minuta).', code: 'INVALID_RUN_TIME' },
      },
    });
    await userEvent.type(field(), '59:59');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi vrijeme' }));
    expect(await screen.findByText('Vrijeme je predugo (najviše 60 minuta).')).toBeInTheDocument();
  });
});
