import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { StandingsTable } from './StandingsTable';
import { standingsFixture, teamStanding } from './fixtures';

describe('StandingsTable', () => {
  it('shows all three criteria plus the sum that decides the winner', () => {
    renderWithProviders(<StandingsTable data={standingsFixture([teamStanding()])} />);
    for (const header of ['Plasman', 'Br.', 'Ekipa', 'Vozilo', 'Nastup', 'Vrijeme', 'Zbir']) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
    const row = screen.getByRole('row', { name: /Leteći Bosanci/ });
    expect(within(row).getByText('45')).toBeInTheDocument();
    expect(within(row).getByText('1:57.20')).toBeInTheDocument();
    expect(within(row).getByText('5')).toBeInTheDocument();
  });

  it('marks a row as provisional until all three inputs are settled', () => {
    renderWithProviders(
      <StandingsTable
        data={standingsFixture([
          teamStanding({
            final: false,
            vehicle: { total: 27, judges: 3, rank: 1, complete: false },
          }),
        ])}
      />,
    );
    expect(screen.getByText('Privremeno')).toBeInTheDocument();
    expect(screen.getByText('3/5 sudija')).toBeInTheDocument();
  });

  it('shows no sum for a team that has not run yet', () => {
    renderWithProviders(
      <StandingsTable
        data={standingsFixture([
          teamStanding({
            time: { ms: null, formatted: null, rank: null },
            placementSum: null,
            overallRank: null,
            final: false,
          }),
        ])}
      />,
    );
    const row = screen.getByRole('row', { name: /Leteći Bosanci/ });
    expect(within(row).getByText('Bez vremena')).toBeInTheDocument();
    expect(within(row).getAllByText('—').length).toBeGreaterThan(0);
  });

  it('shows a dash instead of a start number when a team has none', () => {
    renderWithProviders(
      <StandingsTable data={standingsFixture([teamStanding({ bibNumber: null })])} />,
    );
    const row = screen.getByRole('row', { name: /Leteći Bosanci/ });
    expect(within(row).getByText('—')).toBeInTheDocument();
  });
});
