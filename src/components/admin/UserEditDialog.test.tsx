import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { UserEditDialog } from './UserEditDialog';
import { user } from './fixtures';
import { mockApi, type Routes } from '@/lib/queries/test-server';
import { useSession } from '@/lib/queries/session';

function setup(routes: Routes = {}, subject = user()) {
  const api = mockApi({ 'PATCH /admin/users/u1': { user: user() }, ...routes });
  const onClose = vi.fn();
  return {
    api,
    onClose,
    ...renderWithProviders(<UserEditDialog user={subject} onClose={onClose} />),
  };
}

/** Stands in for the header: renders whatever the session query currently holds. */
function SessionName() {
  const { data } = useSession();
  return <span data-testid="session-name">{data?.displayName ?? ''}</span>;
}

const patchBody = (api: { calls: { method: string; body: unknown }[] }) =>
  api.calls.find((c) => c.method === 'PATCH')?.body;

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('UserEditDialog', () => {
  it('opens filled with the account as it stands', () => {
    setup();
    expect(screen.getByLabelText('Ime i prezime')).toHaveValue('Administrator');
    expect(screen.getByLabelText('Korisničko ime')).toHaveValue('admin');
  });

  it('does NOT announce a password change on open', async () => {
    setup();
    // The old dialog showed this the moment it opened, before anything had
    // happened. It is a consequence, so it may only appear once there is one.
    expect(screen.queryByText(/korisnik će biti odmah odjavljen/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nova lozinka')).toHaveValue('');

    await userEvent.type(screen.getByLabelText('Nova lozinka'), 'N');
    expect(await screen.findByText(/korisnik će biti odmah odjavljen/)).toBeInTheDocument();
  });

  it('sends only the fields that actually changed', async () => {
    const { api } = setup();
    const name = screen.getByLabelText('Ime i prezime');
    await userEvent.clear(name);
    await userEvent.type(name, 'Novo Ime');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(patchBody(api)).toBeDefined());
    // Not the username, not the role, and above all not the password.
    expect(patchBody(api)).toEqual({ displayName: 'Novo Ime' });
  });

  it('omits the password entirely when the field was left blank', async () => {
    const { api } = setup();
    const username = screen.getByLabelText('Korisničko ime');
    await userEvent.clear(username);
    await userEvent.type(username, 'novo.ime');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(patchBody(api)).toBeDefined());
    expect(patchBody(api)).toEqual({ username: 'novo.ime' });
    expect(patchBody(api)).not.toHaveProperty('password');
  });

  it('sends a password only when one was typed', async () => {
    const { api } = setup();
    await userEvent.type(screen.getByLabelText('Nova lozinka'), 'NovaLozinka1');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(patchBody(api)).toBeDefined());
    expect(patchBody(api)).toEqual({ password: 'NovaLozinka1' });
  });

  it('closes without a request when nothing was touched', async () => {
    const { api, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.calls.some((c) => c.method === 'PATCH')).toBe(false);
  });

  it('validates before spending a round-trip', async () => {
    const { api } = setup();
    const username = screen.getByLabelText('Korisničko ime');
    await userEvent.clear(username);
    await userEvent.type(username, 'ab');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByText(/najmanje 3 znaka/)).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'PATCH')).toBe(false);
  });

  it("surfaces the API's refusal and stays open", async () => {
    const { api, onClose } = setup({
      'PATCH /admin/users/u1': {
        status: 409,
        body: { error: 'Korisničko ime je već zauzeto.', code: 'USERNAME_TAKEN' },
      },
    });
    const username = screen.getByLabelText('Korisničko ime');
    await userEvent.clear(username);
    await userEvent.type(username, 'zauzeto');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    expect(await screen.findByText('Korisničko ime je već zauzeto.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(patchBody(api)).toEqual({ username: 'zauzeto' });
  });

  it('updates the header when an admin edits their own account', async () => {
    // The header renders the session's copy of the current user, so this is the
    // bug it fixes: renaming yourself used to leave the old name up there.
    const me = user({ id: 'u1', displayName: 'Stari Admin' });
    // A stateful fake, so the refetch can actually show the change.
    let name = me.displayName;
    mockApi({
      'GET /auth/session': () => ({ user: { ...me, displayName: name } }),
      'PATCH /admin/users/u1': (body: unknown) => {
        name = (body as { displayName?: string }).displayName ?? name;
        return { user: { ...me, displayName: name } };
      },
    });
    renderWithProviders(
      <>
        <SessionName />
        <UserEditDialog user={me} onClose={vi.fn()} />
      </>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('session-name')).toHaveTextContent('Stari Admin'),
    );

    const field = screen.getByLabelText('Ime i prezime');
    await userEvent.clear(field);
    await userEvent.type(field, 'Novi Admin');
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));

    await waitFor(() => expect(screen.getByTestId('session-name')).toHaveTextContent('Novi Admin'));
  });

  it('cancels', async () => {
    const { api, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(api.calls.some((c) => c.method === 'PATCH')).toBe(false);
  });

  it('renders nothing when no row is selected', () => {
    mockApi({});
    renderWithProviders(<UserEditDialog user={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
