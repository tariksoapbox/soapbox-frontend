import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import { Brand } from './Brand';

describe('Brand', () => {
  it('is a wordmark — no Red Bull logo anywhere in this app', () => {
    const { container } = renderWithProviders(<Brand />);
    expect(screen.getByText('Soapbox')).toBeInTheDocument();
    expect(screen.getByText('Sistem bodovanja')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders a larger variant for the sign-in screen', () => {
    renderWithProviders(<Brand size="lg" />);
    expect(screen.getByText('Soapbox')).toBeInTheDocument();
  });
});
