import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { TeamsTab } from './TeamsTab';
import { team } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<TeamsTab />) };
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('TeamsTab', () => {
  it('lists the teams an admin has named', async () => {
    setup({ 'GET /teams': { teams: [team()] } });
    expect(await screen.findByDisplayValue('Leteći Bosanci')).toBeInTheDocument();
  });

  it('creates a team with a start number', async () => {
    const { api } = setup({ 'GET /teams': { teams: [] }, 'POST /admin/teams': { team: team() } });
    await userEvent.type(screen.getByLabelText('Naziv ekipe'), 'Una Kayak');
    await userEvent.type(screen.getByLabelText('Startni broj (opcionalno)'), '6');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj ekipu' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'POST')).toBe(true));
    expect(api.calls.find((c) => c.method === 'POST')!.body).toEqual({
      name: 'Una Kayak',
      bibNumber: 6,
    });
  });

  it('creates a team with no start number at all', async () => {
    const { api } = setup({ 'GET /teams': { teams: [] }, 'POST /admin/teams': { team: team() } });
    await userEvent.type(screen.getByLabelText('Naziv ekipe'), 'Una Kayak');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj ekipu' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'POST')).toBe(true));
    expect(api.calls.find((c) => c.method === 'POST')!.body).toEqual({
      name: 'Una Kayak',
      bibNumber: null,
    });
  });

  it('empties the form after a successful create', async () => {
    setup({ 'GET /teams': { teams: [] }, 'POST /admin/teams': { team: team() } });
    const name = screen.getByLabelText('Naziv ekipe');
    await userEvent.type(name, 'Una Kayak');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj ekipu' }));
    await waitFor(() => expect(name).toHaveValue(''));
  });

  it('reports a start number that is already taken', async () => {
    setup({
      'GET /teams': { teams: [team()] },
      'POST /admin/teams': {
        status: 409,
        body: { error: 'Startni broj je već dodijeljen.', code: 'BIB_TAKEN' },
      },
    });
    await userEvent.type(screen.getByLabelText('Naziv ekipe'), 'Druga Ekipa');
    await userEvent.type(screen.getByLabelText('Startni broj (opcionalno)'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj ekipu' }));
    expect(await screen.findByText('Startni broj je već dodijeljen.')).toBeInTheDocument();
  });

  it('validates the new-team form locally', async () => {
    const { api } = setup({ 'GET /teams': { teams: [] } });
    await userEvent.type(screen.getByLabelText('Naziv ekipe'), 'A');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj ekipu' }));
    expect(await screen.findByText(/najmanje 2 znaka/)).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('warns that deleting a team destroys its scores, then deletes it', async () => {
    const { api } = setup({
      'GET /teams': { teams: [team()] },
      'DELETE /admin/teams/t1': { status: 204 },
    });
    await screen.findByDisplayValue('Leteći Bosanci');
    await userEvent.click(screen.getByRole('button', { name: /Obrisati ekipu\? Leteći Bosanci/ }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/trajno se brišu i sve ocjene/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Obriši' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'DELETE')).toBe(true));
  });

  it('backs out of a delete without touching the team', async () => {
    const { api } = setup({ 'GET /teams': { teams: [team()] } });
    await screen.findByDisplayValue('Leteći Bosanci');
    await userEvent.click(screen.getByRole('button', { name: /Obrisati ekipu\? Leteći Bosanci/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('retries a failed load', async () => {
    const { api } = setup({ 'GET /teams': { status: 500, body: { error: 'Greška na serveru.' } } });
    await screen.findByRole('alert');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });

  it('says so when there are no teams yet', async () => {
    setup({ 'GET /teams': { teams: [] } });
    expect(await screen.findByText('Još nema ekipa. Dodajte prvu.')).toBeInTheDocument();
  });
});
