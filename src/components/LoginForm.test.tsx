import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { LoginForm } from './LoginForm';
import { mockApi, type Routes } from '@/lib/queries/test-server';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const admin = { id: 'a1', username: 'admin', displayName: 'Administrator' };

function setup(routes: Routes) {
  const api = mockApi({ 'GET /auth/session': { user: null }, ...routes });
  return { api, ...renderWithProviders(<LoginForm />) };
}

async function signIn(username: string, password: string) {
  await userEvent.type(screen.getByLabelText('Korisničko ime'), username);
  await userEvent.type(screen.getByLabelText('Lozinka'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Prijavi se' }));
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllGlobals());

describe('LoginForm', () => {
  it('signs an admin in and sends them to the console', async () => {
    const { api } = setup({ 'POST /auth/login': { user: admin } });
    await signIn('admin', 'Soapbox2026#6');

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin'));
    const post = api.calls.find((c) => c.method === 'POST')!;
    expect(post.body).toEqual({ username: 'admin', password: 'Soapbox2026#6' });
  });

  it("shows the API's rejection without saying which half was wrong", async () => {
    setup({
      'POST /auth/login': {
        status: 401,
        body: { error: 'Neispravno korisničko ime ili lozinka.', code: 'INVALID_CREDENTIALS' },
      },
    });
    await signIn('admin', 'pogresna');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Neispravno korisničko ime ili lozinka.',
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('tells a deactivated judge why they are out', async () => {
    setup({
      'POST /auth/login': {
        status: 403,
        body: { error: 'Vaš pristup je deaktiviran. Obratite se administratoru.' },
      },
    });
    await signIn('sudija1', 'Sudija2026#6');
    expect(await screen.findByRole('alert')).toHaveTextContent('deaktiviran');
  });

  it('validates locally before spending a round-trip', async () => {
    const { api } = setup({});
    await userEvent.click(screen.getByRole('button', { name: 'Prijavi se' }));
    expect(await screen.findByText('Unesite korisničko ime.')).toBeInTheDocument();
    expect(screen.getByText('Unesite lozinku.')).toBeInTheDocument();
    expect(api.calls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('lets you check what you typed before signing in', async () => {
    setup({});
    const password = screen.getByLabelText('Lozinka');
    expect(password).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Prikaži lozinku' }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('states that the session ends with the browser, and that there is no sign-up', () => {
    setup({});
    expect(screen.getByText(/Prijava traje dok ne zatvorite aplikaciju/)).toBeInTheDocument();
    expect(screen.getByText(/Račune kreira isključivo administrator/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /registr/i })).not.toBeInTheDocument();
  });

  it('redirects a visitor who arrives already signed in', async () => {
    mockApi({ 'GET /auth/session': { user: admin } });
    renderWithProviders(<LoginForm />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin'));
  });
});
