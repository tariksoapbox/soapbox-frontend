import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { FormAlert } from './FormAlert';
import { ApiError } from '@/lib/api';

describe('FormAlert', () => {
  it("shows the API's own Bosnian message", () => {
    renderWithProviders(<FormAlert error={new ApiError(409, 'Korisničko ime je već zauzeto.')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Korisničko ime je već zauzeto.');
  });

  it('never leaks a runtime error to the user', () => {
    renderWithProviders(<FormAlert error={new TypeError('x.y is not a function')} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Došlo je do greške.');
    expect(screen.getByRole('alert')).not.toHaveTextContent('not a function');
  });

  it('shows nothing when there is no error', () => {
    renderWithProviders(<FormAlert error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
