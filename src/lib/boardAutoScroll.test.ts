import { describe, it, expect } from 'vitest';
import { autoScrollFromUrl } from './boardAutoScroll';

describe('autoScrollFromUrl', () => {
  it('stays off unless the URL asks', () => {
    // The default is a still board: someone may be standing at it.
    expect(autoScrollFromUrl(undefined)).toBe(false);
  });

  it('treats a bare ?vrti as yes', () => {
    expect(autoScrollFromUrl('')).toBe(true);
  });

  it.each(['1', 'da', 'true', 'DA', ' true '])('accepts %s', (value) => {
    expect(autoScrollFromUrl(value)).toBe(true);
  });

  it.each(['0', 'ne', 'false', 'off', 'OFF'])('honours an explicit %s', (value) => {
    // So a link can be turned off by editing one character rather than
    // rewriting the URL from memory.
    expect(autoScrollFromUrl(value)).toBe(false);
  });

  it('takes the first value if the parameter is repeated', () => {
    expect(autoScrollFromUrl(['ne', '1'])).toBe(false);
    expect(autoScrollFromUrl([])).toBe(true);
  });
});
