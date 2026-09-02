import { describe, it, expect } from 'vitest';
import {
  autoScrollFromUrl,
  boardScrollSettingsFromUrl,
  scrollNumberFromUrl,
} from './boardAutoScroll';
import { SCROLL_DEFAULTS } from './boardScroll';

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

describe('scrollNumberFromUrl', () => {
  it('falls back when the parameter is absent', () => {
    expect(scrollNumberFromUrl(undefined, 10)).toBe(10);
  });

  it('takes a number the operator typed', () => {
    expect(scrollNumberFromUrl('7', 10)).toBe(7);
    expect(scrollNumberFromUrl(' 12 ', 10)).toBe(12);
    expect(scrollNumberFromUrl('7.5', 10)).toBe(7.5);
  });

  it('clamps rather than rejects', () => {
    // ?speed=99 is plainly a request to go fast. It goes as fast as the board
    // goes, instead of putting an error in front of a crowd.
    expect(scrollNumberFromUrl('99', 10)).toBe(20);
    expect(scrollNumberFromUrl('0', 10)).toBe(1);
    expect(scrollNumberFromUrl('-4', 10)).toBe(1);
  });

  it('falls back on anything that is not a number', () => {
    for (const junk of ['brzo', '', 'NaN', 'e']) {
      expect(scrollNumberFromUrl(junk, 10)).toBe(10);
    }
  });
});

describe('boardScrollSettingsFromUrl', () => {
  it('defaults to the pace the board shipped with', () => {
    expect(boardScrollSettingsFromUrl({})).toEqual(SCROLL_DEFAULTS);
    expect(SCROLL_DEFAULTS).toEqual({ speed: 10, delayFromStart: 10, delayAtEnd: 5 });
  });

  it('reads all three, independently', () => {
    expect(
      boardScrollSettingsFromUrl({ speed: '20', delayFromStart: '3', delayAtEnd: '15' }),
    ).toEqual({ speed: 20, delayFromStart: 3, delayAtEnd: 15 });
  });

  it('leaves the others alone when only one is given', () => {
    expect(boardScrollSettingsFromUrl({ speed: '2' })).toEqual({
      ...SCROLL_DEFAULTS,
      speed: 2,
    });
  });
});
