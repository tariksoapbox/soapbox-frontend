import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { TimeCell } from './TimeCell';

describe('TimeCell', () => {
  it('shows the clock reading and its place', () => {
    renderWithProviders(
      <TimeCell time={{ ms: 117_200, formatted: '1:57.20', rank: 1, didNotFinish: false }} />,
    );
    expect(screen.getByText('1:57.20')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('says so plainly when a team has not run yet', () => {
    renderWithProviders(
      <TimeCell time={{ ms: null, formatted: null, rank: null, didNotFinish: false }} />,
    );
    expect(screen.getByText('Bez vremena')).toBeInTheDocument();
  });

  it('shows DNF with its place — it is a result, not a blank', () => {
    // Last, shared with anyone else who retired. A dash would say the team is
    // still to run, which is the opposite of what happened.
    renderWithProviders(
      <TimeCell time={{ ms: null, formatted: 'DNF', rank: 16, didNotFinish: true }} />,
    );
    expect(screen.getByText('DNF')).toBeInTheDocument();
    expect(screen.getByText(/16/)).toBeInTheDocument();
  });

  it('keeps the dash for a team that has simply not run yet', () => {
    renderWithProviders(
      <TimeCell time={{ ms: null, formatted: null, rank: null, didNotFinish: false }} />,
    );
    expect(screen.queryByText('DNF')).not.toBeInTheDocument();
  });
});
