import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Button } from '@mui/material';
import { renderWithProviders } from '@/test-utils';
import { PageShell } from './PageShell';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

// Signed out, so the header renders only the wordmark — enough to prove the
// shell composes it. The header's own states are covered in AppHeader.test.
vi.mock('@/lib/queries/session', () => ({
  useSession: () => ({ data: null }),
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('PageShell', () => {
  it('renders the page title as the single h1, above the content', () => {
    renderWithProviders(
      <PageShell title="Glasanje" subtitle="Ocijenite svaku ekipu.">
        <p>sadržaj</p>
      </PageShell>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Glasanje' })).toBeInTheDocument();
    expect(screen.getByText('Ocijenite svaku ekipu.')).toBeInTheDocument();
    expect(screen.getByText('sadržaj')).toBeInTheDocument();
  });

  it('omits the subtitle when there is none, and hosts page actions', () => {
    renderWithProviders(
      <PageShell title="Administracija" actions={<Button>Novi korisnik</Button>} maxWidth="md">
        <p>sadržaj</p>
      </PageShell>,
    );
    expect(screen.getByRole('button', { name: 'Novi korisnik' })).toBeInTheDocument();
  });
});
