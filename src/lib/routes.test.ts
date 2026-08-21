import { describe, it, expect } from 'vitest';
import { homeFor, routes } from './routes';

describe('homeFor', () => {
  it('sends each role to the one screen it can use', () => {
    expect(homeFor('admin')).toBe(routes.admin);
    expect(homeFor('referee')).toBe(routes.judge);
  });

  it('sends anyone signed out to the login screen — nothing here is public', () => {
    expect(homeFor(null)).toBe(routes.login);
    expect(homeFor(undefined)).toBe(routes.login);
  });
});
