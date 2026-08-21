import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { UsersTab } from './UsersTab';
import { user } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';

const me = user({ id: 'a1', username: 'admin', displayName: 'Glavni Admin', role: 'admin' });

function setup(routes: Routes) {
  const api = mockApi({ 'GET /auth/session': { user: me }, ...routes });
  return { api, ...renderWithProviders(<UsersTab />) };
}

const row = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('UsersTab', () => {
  it('lists accounts with their role and whether they are active', async () => {
    setup({ 'GET /admin/users': { users: [me, user()] } });
    await screen.findByText('Sudija 1');
    expect(within(row('Sudija 1')).getByText('Sudija')).toBeInTheDocument();
    expect(within(row('Sudija 1')).getByText('Aktivan')).toBeInTheDocument();
    expect(within(row('Glavni Admin')).getByText('Administrator')).toBeInTheDocument();
  });

  it('explains that the judge count drives when a criterion is complete', async () => {
    setup({ 'GET /admin/users': { users: [me] } });
    expect(await screen.findByText(/Broj aktivnih sudija/)).toBeInTheDocument();
  });

  it('creates a judge', async () => {
    const { api } = setup({
      'GET /admin/users': { users: [me] },
      'POST /admin/users': { user: user() },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Novi korisnik' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Ime i prezime'), 'Sudija 2');
    await userEvent.type(within(dialog).getByLabelText('Korisničko ime'), 'Sudija2');
    await userEvent.type(within(dialog).getByLabelText('Lozinka'), 'Sudija2026#6');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(api.calls.some((c) => c.method === 'POST')).toBe(true));
    expect(api.calls.find((c) => c.method === 'POST')!.body).toEqual({
      displayName: 'Sudija 2',
      // Normalised, so "Sudija2" and "sudija2" can never become two accounts.
      username: 'sudija2',
      password: 'Sudija2026#6',
      role: 'referee',
    });
  });

  it('masks the new password but lets the admin reveal it to read it out', async () => {
    setup({ 'GET /admin/users': { users: [me] } });
    await userEvent.click(screen.getByRole('button', { name: 'Novi korisnik' }));
    const dialog = await screen.findByRole('dialog');
    const password = within(dialog).getByLabelText('Lozinka');
    expect(password).toHaveAttribute('type', 'password');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Prikaži lozinku' }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('reports a username that is taken', async () => {
    setup({
      'GET /admin/users': { users: [me] },
      'POST /admin/users': {
        status: 409,
        body: { error: 'Korisničko ime je već zauzeto.', code: 'USERNAME_TAKEN' },
      },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Novi korisnik' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Ime i prezime'), 'Sudija 1');
    await userEvent.type(within(dialog).getByLabelText('Korisničko ime'), 'sudija1');
    await userEvent.type(within(dialog).getByLabelText('Lozinka'), 'Sudija2026#6');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByText('Korisničko ime je već zauzeto.')).toBeInTheDocument();
  });

  it('validates the new-user form locally', async () => {
    const { api } = setup({ 'GET /admin/users': { users: [me] } });
    await userEvent.click(screen.getByRole('button', { name: 'Novi korisnik' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Korisničko ime'), 'ab');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));
    expect(await within(dialog).findByText(/najmanje 3 znaka/)).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('closes the create dialog on cancel', async () => {
    setup({ 'GET /admin/users': { users: [me] } });
    await userEvent.click(screen.getByRole('button', { name: 'Novi korisnik' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('deactivates a judge', async () => {
    const { api } = setup({
      'GET /admin/users': { users: [me, user()] },
      'PATCH /admin/users/u1': { user: user({ isActive: false }) },
    });
    await screen.findByText('Sudija 1');
    await userEvent.click(within(row('Sudija 1')).getByRole('button', { name: 'Deaktiviraj' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'PATCH')).toBe(true));
    expect(api.calls.find((c) => c.method === 'PATCH')!.body).toEqual({ isActive: false });
  });

  it('offers switch-off, edit and delete on every row', async () => {
    setup({ 'GET /admin/users': { users: [me, user()] } });
    await screen.findByText('Sudija 1');
    const actions = within(row('Sudija 1')).getAllByRole('button');
    expect(actions.map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      'Deaktiviraj',
      'Izmijeni — Sudija 1',
      'Obrisati korisnika? Sudija 1',
    ]);
  });

  it('opens the edit dialog filled with that row', async () => {
    setup({ 'GET /admin/users': { users: [me, user()] } });
    await screen.findByText('Sudija 1');
    await userEvent.click(within(row('Sudija 1')).getByRole('button', { name: /Izmijeni/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Ime i prezime')).toHaveValue('Sudija 1');
    // And it does not announce a password change nobody asked for.
    expect(within(dialog).queryByText(/odjavljen/)).not.toBeInTheDocument();
  });

  it('saves an edit and closes the dialog', async () => {
    const { api } = setup({
      'GET /admin/users': { users: [me, user()] },
      'PATCH /admin/users/u1': { user: user({ displayName: 'Sudija Jedan' }) },
    });
    await screen.findByText('Sudija 1');
    await userEvent.click(within(row('Sudija 1')).getByRole('button', { name: /Izmijeni/ }));

    const dialog = await screen.findByRole('dialog');
    const name = within(dialog).getByLabelText('Ime i prezime');
    await userEvent.clear(name);
    await userEvent.type(name, 'Sudija Jedan');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.find((c) => c.method === 'PATCH')!.body).toEqual({
      displayName: 'Sudija Jedan',
    });
  });

  it('explains that editing is safe and deleting is not', async () => {
    setup({ 'GET /admin/users': { users: [me] } });
    expect(
      await screen.findByText(/Izmjena podataka ne utiče na već poslane ocjene/),
    ).toBeInTheDocument();
  });

  it('offers to reactivate someone who is switched off', async () => {
    setup({ 'GET /admin/users': { users: [me, user({ isActive: false })] } });
    await screen.findByText('Sudija 1');
    expect(within(row('Sudija 1')).getByRole('button', { name: 'Aktiviraj' })).toBeInTheDocument();
    expect(within(row('Sudija 1')).getByText('Deaktiviran')).toBeInTheDocument();
  });

  it('will not let an admin deactivate or delete themselves', async () => {
    setup({ 'GET /admin/users': { users: [me] } });
    await screen.findByText('Glavni Admin');
    const mine = row('Glavni Admin');
    expect(within(mine).getByText('Vi')).toBeInTheDocument();
    expect(within(mine).getByRole('button', { name: 'Deaktiviraj' })).toBeDisabled();
    expect(within(mine).getByRole('button', { name: /Obrisati korisnika\?/ })).toBeDisabled();
  });

  it('warns that deleting a judge destroys their votes, then deletes them', async () => {
    const { api } = setup({
      'GET /admin/users': { users: [me, user()] },
      'DELETE /admin/users/u1': { status: 204 },
    });
    await screen.findByText('Sudija 1');
    await userEvent.click(
      within(row('Sudija 1')).getByRole('button', { name: /Obrisati korisnika\? Sudija 1/ }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/trajno se brišu i sve ocjene/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(api.calls.some((c) => c.method === 'DELETE')).toBe(true));
  });

  it("surfaces the API's refusal to switch off the last admin", async () => {
    setup({
      'GET /admin/users': { users: [me, user()] },
      'PATCH /admin/users/u1': {
        status: 400,
        body: { error: 'Mora postojati barem jedan aktivan administrator.', code: 'LAST_ADMIN' },
      },
    });
    await screen.findByText('Sudija 1');
    await userEvent.click(within(row('Sudija 1')).getByRole('button', { name: 'Deaktiviraj' }));
    expect(
      await screen.findByText('Mora postojati barem jedan aktivan administrator.'),
    ).toBeInTheDocument();
  });

  it('backs out of deleting a judge', async () => {
    const { api } = setup({ 'GET /admin/users': { users: [me, user()] } });
    await screen.findByText('Sudija 1');
    await userEvent.click(
      within(row('Sudija 1')).getByRole('button', { name: /Obrisati korisnika\? Sudija 1/ }),
    );
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Odustani' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.calls.some((c) => c.method === 'DELETE')).toBe(false);
  });

  it('retries a failed load', async () => {
    const { api } = setup({
      'GET /admin/users': { status: 500, body: { error: 'Greška na serveru.' } },
    });
    await screen.findByRole('alert');
    const before = api.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    await waitFor(() => expect(api.calls.length).toBeGreaterThan(before));
  });

  it('reports a failed load', async () => {
    setup({ 'GET /admin/users': { status: 500, body: { error: 'Greška na serveru.' } } });
    expect(await screen.findByRole('alert')).toHaveTextContent('Greška na serveru.');
  });
});
