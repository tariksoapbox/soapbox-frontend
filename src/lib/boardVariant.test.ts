import { describe, it, expect } from 'vitest';
import { boardVariantFromUrl } from './boardVariant';

describe('boardVariantFromUrl', () => {
  it('defaults to the dark board', () => {
    expect(boardVariantFromUrl(undefined)).toBe('dark');
    expect(boardVariantFromUrl('')).toBe('dark');
    expect(boardVariantFromUrl('tamna')).toBe('dark');
  });

  it.each(['svijetla', 'svjetla', 'bijela', 'light', 'white'])(
    'treats %s as the white board',
    (value) => {
      expect(boardVariantFromUrl(value)).toBe('light');
    },
  );

  it('forgives case and stray whitespace', () => {
    // This gets typed into a venue display or pasted from a message.
    expect(boardVariantFromUrl('  SVIJETLA ')).toBe('light');
    expect(boardVariantFromUrl('Bijela')).toBe('light');
  });

  it('falls back to dark rather than erroring on something unrecognised', () => {
    // A room full of spectators should never see a broken page over a typo.
    expect(boardVariantFromUrl('purple')).toBe('dark');
    expect(boardVariantFromUrl(['svijetla', 'tamna'])).toBe('light');
  });
});
