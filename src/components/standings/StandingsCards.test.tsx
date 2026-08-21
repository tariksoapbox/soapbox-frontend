import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { StandingsCards } from './StandingsCards';
import { standingsFixture, teamStanding } from './fixtures';

describe('StandingsCards', () => {
  it('carries the same three criteria the table does, at phone width', () => {
    renderWithProviders(<StandingsCards data={standingsFixture([teamStanding()])} />);
    expect(screen.getByText('Leteći Bosanci')).toBeInTheDocument();
    expect(screen.getByText('Br. 1')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('43')).toBeInTheDocument();
    expect(screen.getByText('1:57.20')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('marks a provisional row and a team with no start number', () => {
    renderWithProviders(
      <StandingsCards data={standingsFixture([teamStanding({ final: false, bibNumber: null })])} />,
    );
    expect(screen.getByText('Privremeno')).toBeInTheDocument();
    expect(screen.getByText('Ekipa')).toBeInTheDocument();
  });

  it('shows a dash for a missing sum', () => {
    renderWithProviders(
      <StandingsCards
        data={standingsFixture([
          teamStanding({ placementSum: null, overallRank: null, final: false }),
        ])}
      />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
