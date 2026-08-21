import { describe, it, expect } from 'vitest';
import { resolveBackendOrigin } from './backendOrigin';

describe('resolveBackendOrigin', () => {
  it('passes an absolute origin through, minus any trailing slash', () => {
    expect(resolveBackendOrigin('https://soapbox-api.onrender.com')).toBe(
      'https://soapbox-api.onrender.com',
    );
    expect(resolveBackendOrigin('https://soapbox-api.onrender.com/')).toBe(
      'https://soapbox-api.onrender.com',
    );
    expect(resolveBackendOrigin('http://localhost:4000')).toBe('http://localhost:4000');
  });

  it('assumes https for a bare hostname', () => {
    // Render's `fromService: { property: host }` injects exactly this shape.
    expect(resolveBackendOrigin('soapbox-api.onrender.com')).toBe(
      'https://soapbox-api.onrender.com',
    );
  });

  it('assumes http for a bare localhost, which has no certificate', () => {
    for (const local of ['localhost:4000', 'localhost', '127.0.0.1:4000', '[::1]:4000']) {
      expect(resolveBackendOrigin(local)).toMatch(/^http:\/\//);
    }
  });

  it('falls back to the local API when nothing is set', () => {
    expect(resolveBackendOrigin(undefined)).toBe('http://localhost:4000');
    expect(resolveBackendOrigin('   ')).toBe('http://localhost:4000');
  });
});
