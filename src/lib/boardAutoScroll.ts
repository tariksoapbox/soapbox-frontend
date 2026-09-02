import { SCROLL_DEFAULTS, SCROLL_RANGE, type BoardScrollSettings } from './boardScroll';

/**
 * Whether a URL is asking the board to scroll itself.
 *
 * Off unless asked for: a board someone is standing at should stay where they
 * left it. `?vrti` turns it on for an unattended screen.
 *
 * As forgiving as the theme parameter, and for the same reason — this gets
 * typed into a display at a racetrack: `?vrti`, `?vrti=1`, `?vrti=da` and
 * `?vrti=true` all mean yes, and an explicit no is honoured so a link can be
 * edited rather than rewritten.
 */
export function autoScrollFromUrl(value: string | string[] | undefined): boolean {
  if (value === undefined) return false;
  const raw = (Array.isArray(value) ? (value[0] ?? '') : value).trim().toLowerCase();
  // `?vrti` with no value is the shortest way to ask for it.
  if (raw === '') return true;
  if (['0', 'ne', 'false', 'off'].includes(raw)) return false;
  return true;
}

/**
 * One of the numeric knobs, read off the URL.
 *
 * Clamped rather than rejected, and falling back rather than erroring: a
 * mistyped number on a venue display should move the board a bit less well, not
 * put an error page in front of a crowd. `speed=99` is plainly a request to go
 * fast, so it goes as fast as the board goes.
 */
export function scrollNumberFromUrl(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim();
  // `?speed=` with nothing after it is an unfinished edit, not a request for
  // zero — and Number('') is 0, which would otherwise clamp to the minimum.
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(SCROLL_RANGE.max, Math.max(SCROLL_RANGE.min, parsed));
}

/**
 * The URL keys, in Bosnian — this link is typed and read by the people running
 * the race, and every other parameter on this page (`tema`, `vrti`) is already
 * in their language. The code behind them stays English, like the rest of the
 * codebase; only what an operator sees is translated.
 */
export const SCROLL_PARAMS = {
  /** Descent pace. */
  brzina: 'speed',
  /** Pace of the trip back up. */
  brzinaGore: 'speedUp',
  /** Seconds held at the top. */
  pauzaNaVrhu: 'delayFromStart',
  /** Seconds held at the bottom. */
  pauzaNaDnu: 'delayAtEnd',
} as const satisfies Record<string, keyof BoardScrollSettings>;

/** All four knobs at once, defaulted and clamped. */
export function boardScrollSettingsFromUrl(
  params: Record<string, string | string[] | undefined>,
): BoardScrollSettings {
  const settings = { ...SCROLL_DEFAULTS };
  for (const [urlKey, setting] of Object.entries(SCROLL_PARAMS)) {
    settings[setting] = scrollNumberFromUrl(params[urlKey], SCROLL_DEFAULTS[setting]);
  }
  return settings;
}
