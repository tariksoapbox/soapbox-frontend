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
 * Whether the board should run endlessly rather than turning around at the
 * bottom. `?ukrug` implies `?vrti` — asking for a loop is asking it to move.
 */
export function loopFromUrl(value: string | string[] | undefined): boolean {
  return autoScrollFromUrl(value);
}

/**
 * One of the numeric knobs, read off the URL.
 *
 * Clamped rather than rejected, and falling back rather than erroring: a
 * mistyped number on a venue display should move the board a bit less well, not
 * put an error page in front of a crowd. `brzina=99` is plainly a request to go
 * fast, so it goes as fast as the board goes.
 */
export function scrollNumberFromUrl(
  value: string | string[] | undefined,
  fallback: number,
  range: { min: number; max: number },
): number {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim();
  // `?brzina=` with nothing after it is an unfinished edit, not a request for
  // zero — and Number('') is 0, which would otherwise clamp to the minimum.
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(range.max, Math.max(range.min, parsed));
}

/**
 * The URL keys, in Bosnian — this link is typed and read by the people running
 * the race, and every other parameter on this page (`tema`, `vrti`, `ukrug`) is
 * already in their language. The code behind them stays English, like the rest
 * of the codebase; only what an operator sees is translated.
 */
export const SCROLL_PARAMS = {
  /** Descent pace. */
  brzina: 'speed',
  /** Pace of the trip back up. Follows `brzina` if it is not given. */
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
  const speed = scrollNumberFromUrl(params.brzina, SCROLL_DEFAULTS.speed, SCROLL_RANGE.speed);
  return {
    speed,
    // The return follows the descent unless it is asked for separately: one
    // number is what an operator usually wants to turn, and a board that came
    // back at a pace unrelated to the one it just set would read as a glitch.
    speedUp: scrollNumberFromUrl(params.brzinaGore, speed, SCROLL_RANGE.speed),
    delayFromStart: scrollNumberFromUrl(
      params.pauzaNaVrhu,
      SCROLL_DEFAULTS.delayFromStart,
      SCROLL_RANGE.delay,
    ),
    delayAtEnd: scrollNumberFromUrl(
      params.pauzaNaDnu,
      SCROLL_DEFAULTS.delayAtEnd,
      SCROLL_RANGE.delay,
    ),
  };
}
