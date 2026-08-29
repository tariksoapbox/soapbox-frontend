import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { JudgesTab } from './JudgesTab';
import { judge } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

function setup(routes: Routes) {
  const api = mockApi(routes);
  return { api, ...renderWithProviders(<JudgesTab />) };
}

const row = (name: string) =>
  screen.getByDisplayValue(name).closest('.MuiCard-root') as HTMLElement;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('JudgesTab', () => {
  it('says plainly that judges do not sign in', async () => {
    setup({ 'GET /admin/judges': { judges: [judge()] } });
    expect(await screen.findByText(/ne prijavljuju u aplikaciju/)).toBeInTheDocument();
  });

  it('creates a judge from a name alone — no username, no password field', async () => {
    const { api } = setup({
      'GET /admin/judges': { judges: [] },
      'POST /admin/judges': { judge: judge() },
    });
    await screen.findByText(/Još nema sudija/);

    expect(screen.queryByLabelText(/Korisničko ime/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Lozinka/)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Ime i prezime sudije'), 'Buba Corelli');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj sudiju' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'POST')).toBe(true));
    expect(api.calls.find((c) => c.method === 'POST')!.body).toEqual({ name: 'Buba Corelli' });
  });

  it('validates the name locally', async () => {
    const { api } = setup({ 'GET /admin/judges': { judges: [] } });
    await userEvent.type(screen.getByLabelText('Ime i prezime sudije'), 'B');
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj sudiju' }));
    expect(await screen.findByText(/najmanje 2 znaka/)).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('renames a judge, which their recorded marks survive', async () => {
    const { api } = setup({
      'GET /admin/judges': { judges: [judge()] },
      'PATCH /admin/judges/j1': { judge: judge({ name: 'Novo ime' }) },
    });
    await screen.findByDisplayValue('Buba Corelli');
    const field = within(row('Buba Corelli')).getByLabelText('Ime i prezime sudije');
    await userEvent.clear(field);
    await userEvent.type(field, 'Novo ime');
    await userEvent.click(within(row('Novo ime')).getByRole('button', { name: 'Spremi naziv' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'PATCH')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PATCH')!.body).toEqual({ name: 'Novo ime' });
  });

  it('puts the saved name back when a rename is refused', async () => {
    setup({
      'GET /admin/judges': { judges: [judge()] },
      'PATCH /admin/judges/j1': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    await screen.findByDisplayValue('Buba Corelli');
    const field = within(row('Buba Corelli')).getByLabelText('Ime i prezime sudije');
    await userEvent.clear(field);
    await userEvent.type(field, 'Novo ime');
    await userEvent.click(within(row('Novo ime')).getByRole('button', { name: 'Spremi naziv' }));
    // The field must never show a name the server did not accept.
    await waitFor(() => expect(field).toHaveValue('Buba Corelli'));
  });

  it('takes a judge off the panel, and offers to bring them back', async () => {
    const { api } = setup({
      'GET /admin/judges': { judges: [judge()] },
      'PATCH /admin/judges/j1': { judge: judge({ isActive: false }) },
    });
    await screen.findByDisplayValue('Buba Corelli');
    await userEvent.click(screen.getByRole('button', { name: 'Ukloni iz žirija' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'PATCH')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PATCH')!.body).toEqual({ isActive: false });
  });

  it('shows an inactive judge as such, with the way back', async () => {
    setup({ 'GET /admin/judges': { judges: [judge({ isActive: false })] } });
    await screen.findByDisplayValue('Buba Corelli');
    expect(screen.getByText('Neaktivan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vrati u žiri' })).toBeInTheDocument();
  });

  it('warns that deleting a judge destroys their marks, then deletes', async () => {
    const { api } = setup({
      'GET /admin/judges': { judges: [judge()] },
      'DELETE /admin/judges/j1': { status: 204 },
    });
    await screen.findByDisplayValue('Buba Corelli');
    await userEvent.click(screen.getByRole('button', { name: /Obrisati sudiju\? Buba Corelli/ }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/trajno se brišu i sve ocjene/)).toBeInTheDocument();
    // And it points at the non-destructive alternative.
    expect(within(dialog).getByText(/uklonite ga iz žirija/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'DELETE')).toBe(true));
  });

  it('backs out of a delete without touching the judge', async () => {
    const { api } = setup({ 'GET /admin/judges': { judges: [judge()] } });
    await screen.findByDisplayValue('Buba Corelli');
    await userEvent.click(screen.getByRole('button', { name: /Obrisati sudiju\?/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('explains that the active count drives when a criterion is complete', async () => {
    setup({ 'GET /admin/judges': { judges: [judge()] } });
    expect(await screen.findByText(/Broj aktivnih sudija/)).toBeInTheDocument();
  });

  it('reports a failed load and retries', async () => {
    const { api } = setup({
      'GET /admin/judges': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });
});
