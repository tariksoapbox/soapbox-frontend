import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { BoardRow } from './BoardRow';
import { publicTeam } from './fixtures';

describe('BoardRow', () => {
  it('shows the placing, the team and the sum that decides it', () => {
    renderWithProviders(<BoardRow team={publicTeam()} index={0} />);
    expect(screen.getByText('Leteći Bosanci')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('opens from the centre outward, not from the left', () => {
    const { container } = renderWithProviders(<BoardRow team={publicTeam()} index={0} />);
    const styles = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('');
    // The whole point of the entrance: a clip-path closed at 50/50 releasing to
    // both edges. A translateX would be the "slides in from the left" version.
    expect(styles).toContain('inset(0 50% 0 50%)');
    expect(styles).not.toContain('translateX');
    expect(container.firstChild).toBeTruthy();
  });

  it('staggers the field, but caps the wait so a long start list still lands', () => {
    const first = renderWithProviders(<BoardRow team={publicTeam()} index={0} />);
    const early = getComputedStyle(first.getByTestId('board-row')).animationDelay;
    first.unmount();

    const third = renderWithProviders(<BoardRow team={publicTeam()} index={3} />);
    const later = getComputedStyle(third.getByTestId('board-row')).animationDelay;
    third.unmount();

    const last = renderWithProviders(<BoardRow team={publicTeam()} index={40} />);
    const capped = getComputedStyle(last.getByTestId('board-row')).animationDelay;

    expect(early).toBe('0ms');
    expect(later).toBe('165ms');
    // Index 40 must not wait 2.2 seconds.
    expect(capped).toBe('660ms');
  });

  it('respects a request for reduced motion', () => {
    renderWithProviders(<BoardRow team={publicTeam()} index={0} />);
    const styles = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('');
    expect(styles).toContain('prefers-reduced-motion');
  });

  it('marks a team that has not run yet without inventing a position', () => {
    renderWithProviders(
      <BoardRow
        team={publicTeam({
          rank: null,
          placementSum: null,
          final: false,
          time: { ms: null, formatted: null, rank: null },
        })}
        index={0}
      />,
    );
    // A dash, never a 0 or a made-up place.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.getByText('–')).toBeInTheDocument();
    expect(screen.getByText(/Privremeno/)).toBeInTheDocument();
  });

  it('says nothing extra for a settled row', () => {
    renderWithProviders(<BoardRow team={publicTeam()} index={0} />);
    expect(screen.queryByText(/Privremeno/)).not.toBeInTheDocument();
  });

  it('handles a team with no start number', () => {
    renderWithProviders(<BoardRow team={publicTeam({ bibNumber: null })} index={0} />);
    expect(screen.queryByText(/^#/)).not.toBeInTheDocument();
  });
});
