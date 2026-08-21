import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { Button } from '@mui/material';
import { renderWithProviders } from '@/test-utils';
import { PasswordField } from './PasswordField';

function Harness({ onSubmit }: { onSubmit?: () => void }) {
  const { control, handleSubmit } = useForm({ defaultValues: { password: '' } });
  return (
    <form onSubmit={handleSubmit(() => onSubmit?.())} noValidate>
      <PasswordField control={control} name="password" label="Lozinka" />
      <Button type="submit">Spremi</Button>
    </form>
  );
}

const field = () => screen.getByLabelText('Lozinka');

describe('PasswordField', () => {
  it('is masked until you ask for it', () => {
    renderWithProviders(<Harness />);
    expect(field()).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Prikaži lozinku' })).toBeInTheDocument();
  });

  it('reveals and re-hides, and the label follows the state', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), 'Soapbox2026#6');

    await userEvent.click(screen.getByRole('button', { name: 'Prikaži lozinku' }));
    expect(field()).toHaveAttribute('type', 'text');
    expect(field()).toHaveValue('Soapbox2026#6');

    await userEvent.click(screen.getByRole('button', { name: 'Sakrij lozinku' }));
    expect(field()).toHaveAttribute('type', 'password');
  });

  it('does not submit the form when toggled', async () => {
    let submitted = false;
    renderWithProviders(<Harness onSubmit={() => (submitted = true)} />);
    // A button inside a form defaults to type="submit"; this one must not.
    await userEvent.click(screen.getByRole('button', { name: 'Prikaži lozinku' }));
    expect(submitted).toBe(false);
  });
});
