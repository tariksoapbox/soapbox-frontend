import { describe, it, expect } from 'vitest';
import { CRITERIA, ROLES } from './contracts';

describe('shared contracts', () => {
  it('has exactly two roles', () => {
    expect(ROLES).toEqual(['admin', 'referee']);
  });

  it('lists only the criteria judges score — run time is the admin only', () => {
    expect(CRITERIA).toEqual(['vehicle', 'performance']);
  });
});
