import { describe, it, expect } from 'vitest';
import { formatClock, formatPlace, judgeCount, pluralBs } from './format';

describe('formatClock', () => {
  it('renders a wall-clock time', () => {
    expect(formatClock('2026-08-21T10:04:05Z')).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('falls back for a missing or unparseable timestamp', () => {
    expect(formatClock(null)).toBe('—');
    expect(formatClock(undefined)).toBe('—');
    expect(formatClock('not a date')).toBe('—');
  });
});

describe('formatPlace', () => {
  it('marks a placement the Bosnian way — with a full stop', () => {
    expect(formatPlace(1)).toBe('1.');
    expect(formatPlace(12)).toBe('12.');
  });

  it('shows nothing for a team that has no place yet', () => {
    expect(formatPlace(null)).toBe('—');
  });
});

describe('pluralBs', () => {
  it.each([
    [1, 'one'],
    [21, 'one'],
    [101, 'one'],
    [2, 'few'],
    [3, 'few'],
    [4, 'few'],
    [24, 'few'],
    [0, 'many'],
    [5, 'many'],
    [11, 'many'],
    [12, 'many'],
    [13, 'many'],
    [14, 'many'],
    [111, 'many'],
  ])('picks the right form for %i', (n, expected) => {
    expect(pluralBs(n, 'one', 'few', 'many')).toBe(expected);
  });
});

describe('judgeCount', () => {
  it('agrees with the number in front of it', () => {
    expect(judgeCount(1)).toBe('1 sudija');
    expect(judgeCount(3)).toBe('3 sudije');
    expect(judgeCount(5)).toBe('5 sudija');
    expect(judgeCount(0)).toBe('0 sudija');
  });
});
