import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { CriterionCell } from './CriterionCell';

describe('CriterionCell', () => {
  it('shows the total and the place it earns', () => {
    renderWithProviders(
      <CriterionCell cell={{ total: 47, judges: 5, rank: 1, complete: true }} expectedJudges={5} />,
    );
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('keeps the judge count visible while the column is short', () => {
    // 27 out of three judges is not comparable with 45 out of five — the
    // fraction is what makes a partial column honest.
    renderWithProviders(
      <CriterionCell
        cell={{ total: 27, judges: 3, rank: 2, complete: false }}
        expectedJudges={5}
      />,
    );
    expect(screen.getByText('3/5 sudija')).toBeInTheDocument();
  });

  it('drops the fraction once every judge is in', () => {
    renderWithProviders(
      <CriterionCell cell={{ total: 45, judges: 5, rank: 1, complete: true }} expectedJudges={5} />,
    );
    expect(screen.queryByText('5/5 sudija')).not.toBeInTheDocument();
  });
});
