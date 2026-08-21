import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { CriterionBallot } from './CriterionBallot';
import { ApiError } from '@/lib/api';

const props = {
  criterion: 'vehicle' as const,
  label: 'Kreativnost izrade vozila',
  cell: { points: null, submittedAt: null },
  onSubmit: vi.fn(),
  isSubmitting: false,
  error: null,
};

describe('CriterionBallot', () => {
  it('will not send until a score is chosen', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<CriterionBallot {...props} onSubmit={onSubmit} />);
    // Choosing is a separate step from sending, because sending is irreversible.
    expect(screen.getByRole('button', { name: 'Pošalji ocjenu' })).toBeDisabled();
    await userEvent.click(screen.getByRole('radio', { name: '9' }));
    const send = screen.getByRole('button', { name: 'Pošalji ocjenu 9' });
    expect(send).toBeEnabled();
    await userEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith(9);
  });

  it('names the score on the button, so the tap is unambiguous', async () => {
    renderWithProviders(<CriterionBallot {...props} />);
    await userEvent.click(screen.getByRole('radio', { name: '3' }));
    expect(screen.getByRole('button', { name: 'Pošalji ocjenu 3' })).toBeInTheDocument();
  });

  it('locks itself while sending', async () => {
    const { rerender } = renderWithProviders(<CriterionBallot {...props} />);
    await userEvent.click(screen.getByRole('radio', { name: '5' }));
    rerender(<CriterionBallot {...props} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Slanje…' })).toBeDisabled();
  });

  it('shows the cast score, with no way to change it', () => {
    renderWithProviders(
      <CriterionBallot {...props} cell={{ points: 9, submittedAt: '2026-08-21T10:04:05Z' }} />,
    );
    expect(screen.getByText('Poslano')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    // The picker is gone entirely — a submitted vote is final for the judge.
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it("surfaces the API's rejection next to the cell it belongs to", () => {
    renderWithProviders(
      <CriterionBallot {...props} error={new ApiError(409, 'Već ste poslali ocjenu.')} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Već ste poslali ocjenu.');
  });

  it('falls back to a neutral message for a non-API error', () => {
    renderWithProviders(<CriterionBallot {...props} error={new Error('boom')} />);
    expect(screen.getByRole('alert')).not.toHaveTextContent('boom');
  });
});
