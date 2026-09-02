import { describe, it, expect } from 'vitest';
import { boardDisplayFont, darkBoardTheme, lightBoardTheme, theme } from './theme';

/** WCAG relative luminance / contrast, so the palette is checked not asserted. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}
function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

describe('the two board palettes', () => {
  it('invert the ground while keeping the same red', () => {
    expect(theme.palette.background.default).toBe('#0B1436');
    expect(lightBoardTheme.palette.background.default).toBe('#FFFFFF');
    // The brand colour is the constant; only what it sits on changes.
    expect(lightBoardTheme.palette.primary.main).toBe(theme.palette.primary.main);
  });

  it('define every brand token in both, so no component can fall through', () => {
    const keys = Object.keys(theme.palette.brand).sort();
    expect(Object.keys(lightBoardTheme.palette.brand).sort()).toEqual(keys);
    for (const key of keys) {
      expect(lightBoardTheme.palette.brand[key as keyof typeof theme.palette.brand]).toBeTruthy();
    }
  });

  it('give the light variant readable text on both of its surfaces', () => {
    // Two grounds, not one: text lands on the page and on a row, and they are
    // not always the same colour. Checking only the page ground once let a
    // secondary through at 4.4:1 on a ground that has since changed again.
    const page = lightBoardTheme.palette.background.default;
    const row = lightBoardTheme.palette.brand.boardRowBg;
    for (const ground of [page, row]) {
      expect(contrast(lightBoardTheme.palette.text.primary, ground)).toBeGreaterThan(4.5);
      expect(contrast(lightBoardTheme.palette.text.secondary, ground)).toBeGreaterThan(4.5);
    }
    // Red is read as text only on a row — as the podium's total. On the blue
    // page it is a fill with white on it, checked separately.
    expect(contrast(lightBoardTheme.palette.primary.main, row)).toBeGreaterThan(4.5);
  });

  it('never leaves board text to inherit the console page colour', () => {
    // The bug this replaced: with `cssVariables` the console writes body colour
    // to :root, a nested provider cannot override it, and the light board
    // rendered white text on a white ground. Both variants must state an ink
    // that contrasts with their own ground.
    for (const t of [darkBoardTheme, lightBoardTheme]) {
      expect(contrast(t.palette.text.primary, t.palette.background.default)).toBeGreaterThan(4.5);
    }
  });

  it('keeps white legible on the red badge in both variants', () => {
    for (const t of [theme, lightBoardTheme]) {
      expect(contrast('#FFFFFF', t.palette.primary.main)).toBeGreaterThan(4.5);
    }
  });

  it('gives board rows a surface distinct from the page in both variants', () => {
    // A row that matches the page ground has no edge to read.
    expect(theme.palette.brand.boardRowBg).not.toBe(theme.palette.background.default);
    // On white the row fill matches the page, so the border is what draws the
    // edge — it must differ from both, or the rows dissolve into the page.
    const light = lightBoardTheme.palette;
    if (light.brand.boardRowBg === light.background.default) {
      expect(light.brand.boardRowBorder).not.toBe(light.brand.boardRowBg);
      expect(light.brand.boardRowBorder).not.toBe(light.background.default);
    }
    expect(light.brand.boardRowBg).not.toBe(light.brand.elevated);
  });

  describe('typefaces', () => {
    it('puts Futura on both board variants and leaves the console on Poppins', () => {
      // The licence covers the event's own screens. The judging console is an
      // internal tool and stays on the app face.
      for (const t of [darkBoardTheme, lightBoardTheme]) {
        expect(t.typography.fontFamily).toContain('--font-rb-book');
      }
      expect(theme.typography.fontFamily).not.toContain('--font-rb');
      expect(theme.typography.fontFamily).toContain('--font-poppins');
    });

    it('falls back to Poppins if the Futura files never arrive', () => {
      // A board that renders in the wrong face still reads; one that renders in
      // Times, or not at all, does not.
      for (const stack of [darkBoardTheme.typography.fontFamily, boardDisplayFont]) {
        expect(stack).toContain('--font-poppins');
        expect(stack).toMatch(/sans-serif$/);
      }
    });

    it('reaches for the condensed cut first on display text', () => {
      expect(boardDisplayFont.indexOf('--font-rb-cond')).toBeLessThan(
        boardDisplayFont.indexOf('--font-rb-book'),
      );
    });
  });
});
