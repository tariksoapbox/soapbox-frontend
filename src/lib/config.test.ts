import { describe, it, expect } from 'vitest';
import { API_BASE_URL } from './config';

describe('API_BASE_URL', () => {
  it('is same-origin, so the session cookie stays first-party', () => {
    // A cross-site base would put the cookie at the mercy of the browser's
    // third-party-cookie policy — see next.config.ts.
    expect(API_BASE_URL).toBe('/api');
  });
});
