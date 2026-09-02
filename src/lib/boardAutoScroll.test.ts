import { describe, it, expect } from 'vitest';
import {
  autoScrollFromUrl,
  boardScrollSettingsFromUrl,
  loopFromUrl,
  scrollNumberFromUrl,
  SCROLL_PARAMS,
} from './boardAutoScroll';
import { SCROLL_DEFAULTS, SCROLL_RANGE } from './boardScroll';

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
  const speed = SCROLL_RANGE.speed;

  it('falls back when the parameter is absent', () => {
    expect(scrollNumberFromUrl(undefined, 10, speed)).toBe(10);
  });

  it('takes a number the operator typed', () => {
    expect(scrollNumberFromUrl('7', 10, speed)).toBe(7);
    expect(scrollNumberFromUrl(' 12 ', 10, speed)).toBe(12);
    expect(scrollNumberFromUrl('7.5', 10, speed)).toBe(7.5);
  });

  it('clamps rather than rejects', () => {
    // ?speedDown=99 is plainly a request to go fast. It goes as fast as the board
    // goes, instead of putting an error in front of a crowd.
    expect(scrollNumberFromUrl('99', 10, speed)).toBe(50);
    expect(scrollNumberFromUrl('0', 10, speed)).toBe(1);
    expect(scrollNumberFromUrl('-4', 10, speed)).toBe(1);
  });

  it('clamps each parameter to its own range', () => {
    // A speed of 50 is a fast board; a 50-second pause is a stopped one.
    expect(scrollNumberFromUrl('50', 10, SCROLL_RANGE.speed)).toBe(50);
    expect(scrollNumberFromUrl('50', 10, SCROLL_RANGE.delay)).toBe(20);
  });

  it('falls back on anything that is not a number', () => {
    for (const junk of ['brzo', '', 'NaN', 'e']) {
      expect(scrollNumberFromUrl(junk, 10, speed)).toBe(10);
    }
  });
});

describe('boardScrollSettingsFromUrl', () => {
  it('defaults to the pace the board shipped with', () => {
    expect(boardScrollSettingsFromUrl({})).toEqual(SCROLL_DEFAULTS);
    expect(SCROLL_DEFAULTS).toEqual({
      speed: 10,
      speedUp: 10,
      delayFromStart: 10,
      delayAtEnd: 5,
    });
  });

  it('reads all four, independently', () => {
    expect(
      boardScrollSettingsFromUrl({
        speedDown: '50',
        speedUp: '4',
        delayAtTop: '3',
        delayAtBottom: '15',
      }),
    ).toEqual({ speed: 50, speedUp: 4, delayFromStart: 3, delayAtEnd: 15 });
  });

  it('lets the return follow the descent unless it is asked for separately', () => {
    // One number is what an operator usually wants to turn. A board that came
    // back at a pace unrelated to the one it just set would read as a glitch.
    expect(boardScrollSettingsFromUrl({ speedDown: '30' })).toMatchObject({
      speed: 30,
      speedUp: 30,
    });
    expect(boardScrollSettingsFromUrl({ speedDown: '30', speedUp: '5' })).toMatchObject({
      speed: 30,
      speedUp: 5,
    });
  });

  it('leaves the others alone when only one is given', () => {
    expect(boardScrollSettingsFromUrl({ delayAtBottom: '2' })).toEqual({
      ...SCROLL_DEFAULTS,
      delayAtEnd: 2,
    });
  });

  it('reads the URL names, not the names the code uses for them', () => {
    // `speed` and `delayFromStart` are what the settings are called inside the
    // app. The URL says speedDown and delayAtTop, and only those.
    expect(
      boardScrollSettingsFromUrl({ speed: '20', delayFromStart: '2', delayAtEnd: '2' }),
    ).toEqual(SCROLL_DEFAULTS);
  });

  it('names the two directions as a matching pair', () => {
    // A lone `speed` beside a `speedUp` leaves an operator guessing which
    // direction the unqualified one meant.
    const keys = Object.keys(SCROLL_PARAMS);
    expect(keys).toContain('speedDown');
    expect(keys).toContain('speedUp');
    expect(keys).toContain('delayAtTop');
    expect(keys).toContain('delayAtBottom');
  });

  it('names every setting exactly once', () => {
    // A typo'd map entry would silently leave one knob permanently at default.
    const mapped = Object.values(SCROLL_PARAMS);
    expect(new Set(mapped).size).toBe(mapped.length);
    expect(mapped.sort()).toEqual(Object.keys(SCROLL_DEFAULTS).sort());
  });
});

describe('loopFromUrl', () => {
  it('is off unless the URL asks', () => {
    expect(loopFromUrl(undefined)).toBe(false);
  });

  it('reads a bare ?ukrug as yes', () => {
    expect(loopFromUrl('')).toBe(true);
    expect(loopFromUrl('da')).toBe(true);
  });

  it('honours an explicit no', () => {
    expect(loopFromUrl('ne')).toBe(false);
  });
});
