import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { AuthGuard } from './AuthGuard';
import type { SessionUser } from '@/schemas/contracts';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const session = vi.fn<() => { data: SessionUser | null | undefined; isPending: boolean }>();
vi.mock('@/lib/queries/session', () => ({ useSession: () => session() }));

const admin: SessionUser = { id: 'a1', username: 'admin', displayName: 'Administrator' };

beforeEach(() => vi.clearAllMocks());

describe('AuthGuard', () => {
  it('renders the console for a signed-in administrator', () => {
    session.mockReturnValue({ data: admin, isPending: false });
    renderWithProviders(
      <AuthGuard>
        <p>konzola</p>
      </AuthGuard>,
    );
    expect(screen.getByText('konzola')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends a signed-out visitor to the login screen', async () => {
    session.mockReturnValue({ data: null, isPending: false });
    renderWithProviders(
      <AuthGuard>
        <p>konzola</p>
      </AuthGuard>,
    );
    // Never flash a screen the user is about to be moved off.
    expect(screen.queryByText('konzola')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/prijava'));
  });

  it('waits, rather than redirecting, while the session is still loading', () => {
    session.mockReturnValue({ data: undefined, isPending: true });
    renderWithProviders(
      <AuthGuard>
        <p>konzola</p>
      </AuthGuard>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
