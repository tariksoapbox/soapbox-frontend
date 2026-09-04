import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { BOARD_EASING, BOARD_MOTION_MS } from './boardMotion';
import { FLIP_MS } from './flipRows';

/**
 * The board's four effects are often on screen together. Given their own
 * timings they read as four unrelated things happening at once, so this holds
 * them to the shared tokens rather than to a number typed in four places.
 */
describe('board motion', () => {
  it('gives the travel animation the same timing as the rest', () => {
    expect(FLIP_MS).toBe(BOARD_MOTION_MS);
  });

  const sources = [
    'src/components/board/BoardRow.tsx',
    'src/components/board/PublicBoard.tsx',
    'src/lib/flipRows.ts',
  ];

  /**
   * Comments are prose and may say "620ms" freely; it is the code that must
   * not. Stripping them keeps this guard from banning its own explanation.
   */
  const code = (file: string) =>
    readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

  it.each(sources)('leaves no hard-coded duration in %s', (file) => {
    // A literal `620ms` or `1400ms` in a component is how the four drifted
    // apart in the first place.
    expect(code(file)).not.toMatch(/\b\d{3,4}ms\b/);
  });

  it.each(sources)('leaves no hard-coded easing curve in %s', (file) => {
    const found = [...code(file).matchAll(/cubic-bezier\([^)]*\)/g)].map((m) => m[0]);
    // The token itself holds one; nothing else may.
    expect(found.filter((c) => !BOARD_EASING.includes(c))).toEqual([]);
  });
});
