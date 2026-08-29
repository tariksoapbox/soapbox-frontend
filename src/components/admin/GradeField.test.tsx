import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { GradeField, gradeText, isValidGrade } from './GradeField';

const field = () => screen.getByLabelText('Ocjena');

/** Controlled, the way the grid uses it. */
function Harness({ initial = '', onCommit }: { initial?: string; onCommit?: () => void }) {
  const [text, setText] = useState(initial);
  return <GradeField label="Ocjena" value={text} onChange={setText} onCommit={onCommit} />;
}

describe('GradeField', () => {
  it('is a typed number, not ten buttons', () => {
    renderWithProviders(<Harness />);
    expect(field()).toHaveValue('');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    // `inputMode`, not `type=number`: no spinners, and no scroll-to-change.
    expect(field()).toHaveAttribute('inputmode', 'numeric');
    expect(field()).not.toHaveAttribute('type', 'number');
  });

  it('takes a whole mark from 1 to 10', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), '10');
    expect(field()).toHaveValue('10');
  });

  it.each(['a', '-', '.', '/'])('refuses %s outright', async (bad) => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), bad);
    expect(field()).toHaveValue('');
  });

  it('refuses a digit that would push the mark past 10', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(field(), '11');
    // The 1 lands; the second is rejected, so the field never shows 11.
    expect(field()).toHaveValue('1');
  });

  it('commits on blur and on Enter, not on every keystroke', async () => {
    const onCommit = vi.fn();
    renderWithProviders(<Harness onCommit={onCommit} />);
    await userEvent.type(field(), '10');
    // Otherwise typing "10" would write a 1 first.
    expect(onCommit).not.toHaveBeenCalled();

    await userEvent.type(field(), '{Enter}');
    expect(onCommit).toHaveBeenCalledTimes(1);

    await userEvent.click(field());
    await userEvent.tab();
    expect(onCommit).toHaveBeenCalledTimes(2);
  });

  it('clears to blank — never a zero', async () => {
    renderWithProviders(<Harness initial="8" />);
    await userEvent.clear(field());
    expect(field()).toHaveValue('');
  });
});

describe('isValidGrade', () => {
  it.each(['1', '5', '10'])('accepts %s', (v) => expect(isValidGrade(v)).toBe(true));
  it.each(['0', '11', '', ' ', '1.5', '-1', 'x', '010'])('rejects %s', (v) =>
    expect(isValidGrade(v)).toBe(false),
  );
});

describe('gradeText', () => {
  it('renders a stored mark, and a blank for none', () => {
    expect(gradeText(8)).toBe('8');
    expect(gradeText(undefined)).toBe('');
  });
});
