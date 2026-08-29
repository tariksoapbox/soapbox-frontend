import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { GradeField, isValidGrade } from './GradeField';

const field = () => screen.getByLabelText('Ocjena — Buba Corelli');

/** Controlled, the way the dialog uses it — so typing behaves like it does live. */
function Harness({ initial = null }: { initial?: number | null }) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <>
      <GradeField judgeName="Buba Corelli" value={value} onChange={setValue} />
      <span data-testid="value">{value === null ? 'blank' : value}</span>
    </>
  );
}

const stored = () => screen.getByTestId('value').textContent;

describe('GradeField', () => {
  it('is a typed number, not ten buttons', () => {
    // The picker it replaced was for a judge on a phone; an admin transcribing
    // a stack of cards types and tabs.
    renderWithProviders(<GradeField judgeName="Buba Corelli" value={null} onChange={vi.fn()} />);
    expect(field()).toHaveValue('');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(field()).toHaveAttribute('inputmode', 'numeric');
  });

  it('reports a whole mark from 1 to 10', async () => {
    const onChange = vi.fn();
    renderWithProviders(<GradeField judgeName="Buba Corelli" value={null} onChange={onChange} />);
    await userEvent.type(field(), '8');
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it('accepts 10, typed digit by digit', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), '10');
    expect(stored()).toBe('10');
  });

  it.each(['a', '-', '.', '/', '0'])('refuses %s outright', async (bad) => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), bad);
    expect(stored()).toBe('blank');
    expect(field()).toHaveValue('');
  });

  it('refuses a second digit that would push the mark past 10', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), '11');
    // The 1 lands, the second 1 is rejected — the field never shows 11.
    expect(stored()).toBe('1');
    expect(field()).toHaveValue('1');
  });

  it('clears to blank, which means "not written down yet" — never a zero', async () => {
    const onChange = vi.fn();
    renderWithProviders(<GradeField judgeName="Buba Corelli" value={8} onChange={onChange} />);
    expect(field()).toHaveValue('8');
    await userEvent.clear(field());
    expect(onChange).toHaveBeenCalledWith(null);
    expect(onChange).not.toHaveBeenCalledWith(0);
  });

  it('locks while a save is in flight', () => {
    renderWithProviders(
      <GradeField judgeName="Buba Corelli" value={8} disabled onChange={vi.fn()} />,
    );
    expect(field()).toBeDisabled();
  });
});

describe('isValidGrade', () => {
  it.each(['1', '5', '10'])('accepts %s', (v) => expect(isValidGrade(v)).toBe(true));
  it.each(['0', '11', '', ' ', '1.5', '-1', 'x', '010'])('rejects %s', (v) =>
    expect(isValidGrade(v)).toBe(false),
  );
});
