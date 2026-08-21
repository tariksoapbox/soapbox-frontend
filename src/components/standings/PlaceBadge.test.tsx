import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { PlaceBadge } from './PlaceBadge';

describe('PlaceBadge', () => {
  it.each([
    [1, '1.'],
    [2, '2.'],
    [3, '3.'],
    [7, '7.'],
  ])('always prints the number, so the podium colour is never the only cue', (rank, label) => {
    const { unmount } = renderWithProviders(<PlaceBadge rank={rank} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    unmount();
  });

  it('shows a dash for a team with no place yet', () => {
    renderWithProviders(<PlaceBadge rank={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
