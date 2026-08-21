import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { TimeCell } from './TimeCell';

describe('TimeCell', () => {
  it('shows the clock reading and its place', () => {
    renderWithProviders(<TimeCell time={{ ms: 117_200, formatted: '1:57.20', rank: 1 }} />);
    expect(screen.getByText('1:57.20')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('says so plainly when a team has not run yet', () => {
    renderWithProviders(<TimeCell time={{ ms: null, formatted: null, rank: null }} />);
    expect(screen.getByText('Bez vremena')).toBeInTheDocument();
  });
});
