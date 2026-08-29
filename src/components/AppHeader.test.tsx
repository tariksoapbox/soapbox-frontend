import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { AppHeader } from './AppHeader';
import type { SessionUser } from '@/schemas/contracts';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));

const logoutMutate = vi.fn();
const session = vi.fn<() => { data: SessionUser | null }>();
vi.mock('@/lib/queries/session', () => ({
  useSession: () => session(),
  useLogout: () => ({ mutate: logoutMutate, isPending: false }),
}));

const judge: SessionUser = {
  id: 'u1',
  username: 'sudija1',
  displayName: 'Sudija 1',
};
const admin: SessionUser = {
  id: 'a1',
  username: 'admin',
  // Not "Administrator" — that is also the role label, and a test that cannot
  // tell the two apart is not testing anything.
  displayName: 'Glavni Admin',
};

beforeEach(() => vi.clearAllMocks());

describe('AppHeader', () => {
  it('shows only the wordmark before sign-in', () => {
    session.mockReturnValue({ data: null });
    renderWithProviders(<AppHeader />);
    expect(screen.getByText('Soapbox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Odjava' })).not.toBeInTheDocument();
  });

  it('carries no navigation at all — each console switches its own screens', () => {
    session.mockReturnValue({ data: judge });
    renderWithProviders(<AppHeader />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('names who is signed in, and their role', () => {
    session.mockReturnValue({ data: admin });
    renderWithProviders(<AppHeader />);
    expect(screen.getByText('Glavni Admin')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('signs the user out', async () => {
    session.mockReturnValue({ data: judge });
    renderWithProviders(<AppHeader />);
    expect(screen.getByText('Sudija 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Odjava/ }));
    expect(logoutMutate).toHaveBeenCalledOnce();
  });
});
