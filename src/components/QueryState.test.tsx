import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { QueryState } from './QueryState';
import { ApiError } from '@/lib/api';

describe('QueryState', () => {
  it('announces loading to a screen reader', () => {
    renderWithProviders(
      <QueryState isPending error={null}>
        <p>content</p>
      </QueryState>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByText('content')).not.toBeInTheDocument();
  });

  it('shows the API message and offers a retry', async () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <QueryState
        isPending={false}
        error={new ApiError(0, 'Nema veze sa serverom.')}
        onRetry={onRetry}
      >
        <p>content</p>
      </QueryState>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Nema veze sa serverom.');
    await userEvent.click(screen.getByRole('button', { name: 'Pokušajte ponovo' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('falls back to the generic message and hides retry when none is given', () => {
    renderWithProviders(
      <QueryState isPending={false} error={new Error('boom')}>
        <p>content</p>
      </QueryState>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Došlo je do greške.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the empty message', () => {
    renderWithProviders(
      <QueryState isPending={false} error={null} isEmpty emptyMessage="Još nema ekipa.">
        <p>content</p>
      </QueryState>,
    );
    expect(screen.getByText('Još nema ekipa.')).toBeInTheDocument();
  });

  it('renders the children once there is data', () => {
    renderWithProviders(
      <QueryState isPending={false} error={null} isEmpty={false}>
        <p>content</p>
      </QueryState>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
