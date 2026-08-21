import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { ConfirmDialog } from './ConfirmDialog';

const base = {
  open: true,
  title: 'Obrisati ekipu?',
  description: 'Brišu se i sve ocjene.',
  onConfirm: vi.fn(),
  onClose: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('spells out the consequence before the destructive action', async () => {
    const onConfirm = vi.fn();
    renderWithProviders(<ConfirmDialog {...base} onConfirm={onConfirm} />);
    expect(screen.getByText('Brišu se i sve ocjene.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('cancels', async () => {
    const onClose = vi.fn();
    renderWithProviders(<ConfirmDialog {...base} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Odustani' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('locks both buttons while the write is in flight', () => {
    renderWithProviders(<ConfirmDialog {...base} busy confirmLabel="Poništi ocjenu" />);
    expect(screen.getByRole('button', { name: 'Poništi ocjenu' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Odustani' })).toBeDisabled();
  });

  it('renders nothing when closed', () => {
    renderWithProviders(<ConfirmDialog {...base} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
