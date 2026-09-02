import { describe, it, expect } from 'vitest';
import { boardVariantFromUrl } from './boardVariant';

describe('boardVariantFromUrl', () => {
  it('defaults to the dark board', () => {
    expect(boardVariantFromUrl(undefined)).toBe('dark');
    expect(boardVariantFromUrl('')).toBe('dark');
    expect(boardVariantFromUrl('dark')).toBe('dark');
  });

  it.each(['light', 'light', 'white', 'light', 'white'])(
    'treats %s as the white board',
    (value) => {
      expect(boardVariantFromUrl(value)).toBe('light');
    },
  );

  it('forgives case and stray whitespace', () => {
    // This gets typed into a venue display or pasted from a message.
    expect(boardVariantFromUrl('  LIGHT ')).toBe('light');
    expect(boardVariantFromUrl('White')).toBe('light');
  });

  it('falls back to dark rather than erroring on something unrecognised', () => {
    // A room full of spectators should never see a broken page over a typo.
    expect(boardVariantFromUrl('purple')).toBe('dark');
    expect(boardVariantFromUrl(['light', 'dark'])).toBe('light');
  });
});
