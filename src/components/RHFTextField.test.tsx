import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@mui/material';
import { renderWithProviders } from '@/test-utils';
import { RHFTextField } from './RHFTextField';

const schema = z.object({ name: z.string().min(2, 'Prekratko.') });

function Harness({ helperText }: { helperText?: string }) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });
  return (
    <form onSubmit={handleSubmit(() => undefined)} noValidate>
      <RHFTextField control={control} name="name" label="Naziv" helperText={helperText} />
      <Button type="submit">Spremi</Button>
    </form>
  );
}

describe('RHFTextField', () => {
  it('is always labelled', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByLabelText('Naziv')).toBeInTheDocument();
  });

  it('shows the hint until validation has something to say', async () => {
    renderWithProviders(<Harness helperText="Najmanje 2 znaka." />);
    expect(screen.getByText('Najmanje 2 znaka.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    // The error replaces the hint in the same slot, under the field it is about.
    expect(await screen.findByText('Prekratko.')).toBeInTheDocument();
    expect(screen.queryByText('Najmanje 2 znaka.')).not.toBeInTheDocument();
  });

  it('marks the input invalid for assistive tech, not just visually', async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByText('Prekratko.')).toBeInTheDocument();
    expect(screen.getByLabelText('Naziv')).toHaveAttribute('aria-invalid', 'true');
  });

  it('writes through to the form', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(screen.getByLabelText('Naziv'), 'Una Kayak');
    expect(screen.getByLabelText('Naziv')).toHaveValue('Una Kayak');
  });
});
