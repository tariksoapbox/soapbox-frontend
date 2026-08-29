import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils';
import { ScorePicker } from './ScorePicker';

describe('ScorePicker', () => {
  it('offers every whole score from 1 to 10 and nothing else', () => {
    renderWithProviders(<ScorePicker value={null} onChange={vi.fn()} labelledBy="l" />);
    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(10);
    expect(options.map((o) => o.textContent)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
    ]);
  });

  it('reports the mark that was picked', async () => {
    const onChange = vi.fn();
    renderWithProviders(<ScorePicker value={null} onChange={onChange} labelledBy="l" />);
    await userEvent.click(screen.getByRole('radio', { name: '8' }));
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it('clears when the selected mark is picked again', async () => {
    const onChange = vi.fn();
    renderWithProviders(<ScorePicker value={8} onChange={onChange} labelledBy="l" />);
    await userEvent.click(screen.getByRole('radio', { name: '8' }));
    // Back to blank — "not written down yet" — rather than to a zero.
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('marks the chosen value for assistive tech, not by colour alone', () => {
    renderWithProviders(<ScorePicker value={8} onChange={vi.fn()} labelledBy="l" />);
    expect(screen.getByRole('radio', { name: '8' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '7' })).toHaveAttribute('aria-checked', 'false');
  });

  it('is a labelled group', () => {
    renderWithProviders(
      <>
        <span id="l">Buba Corelli</span>
        <ScorePicker value={null} onChange={vi.fn()} labelledBy="l" />
      </>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Buba Corelli' })).toBeInTheDocument();
  });

  it('locks every option while a save is in flight', () => {
    renderWithProviders(<ScorePicker value={8} onChange={vi.fn()} disabled labelledBy="l" />);
    for (const option of screen.getAllByRole('radio')) expect(option).toBeDisabled();
  });
});
