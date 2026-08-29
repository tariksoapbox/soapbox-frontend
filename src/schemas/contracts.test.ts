import { describe, it, expect } from 'vitest';
import { CRITERIA } from './contracts';

describe('shared contracts', () => {
  it('lists only the criteria judges mark — run time is entered separately', () => {
    expect(CRITERIA).toEqual(['vehicle', 'performance']);
  });

  it('has no roles: everyone who can sign in is an administrator', async () => {
    const contracts = (await import('./contracts')) as Record<string, unknown>;
    expect(contracts).not.toHaveProperty('ROLES');
  });
});
