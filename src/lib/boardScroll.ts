/**
 * The unattended-display scroll cycle.
 *
 * A board longer than the screen only shows its leaders, which is the wrong
 * half for the teams standing in front of it. With `?vrti` on the URL the page
 * walks itself down the list and comes back:
 *
 *   hold at the top → ease down the list → hold at the bottom → snap back up
 *
 * Deliberately not a component: this manipulates the scroll position of the
 * document, and keeping it as a plain start/stop function makes the whole cycle
 * testable without rendering anything.
 */

/**
 * The three knobs an operator can turn from the URL, all on the same 1–20
 * scale so there is one range to remember rather than three.
 */
export interface BoardScrollSettings {
  /** Descent. 1 slowest, 20 fastest. 10 is the pace the board shipped with. */
  speed: number;
  /** The trip back up, same scale. 10 is the 700ms it shipped with. */
  speedUp: number;
  /** Seconds at the top before setting off. */
  delayFromStart: number;
  /** Seconds at the bottom before coming back. */
  delayAtEnd: number;
}

export const SCROLL_RANGE = { min: 1, max: 20 } as const;

export const SCROLL_DEFAULTS: BoardScrollSettings = {
  speed: 10,
  speedUp: 10,
  delayFromStart: 10,
  delayAtEnd: 5,
};

/**
 * Speed 10 means 90px/s, so the default setting reproduces the pace exactly.
 * The scale is linear from there: 1 crawls at 9px/s, 20 runs at 180px/s.
 */
const PX_PER_SEC_PER_STEP = 9;

/** The ease floor at the default speed; scaled below so it never fights a
 *  deliberately fast setting on a short board. */
const MIN_DOWN_MS_AT_DEFAULT_SPEED = 4_000;

/**
 * The return is a duration, not a pace: it is one movement rather than a second
 * reading pass, so it should not get longer just because the board did. Divided
 * by the setting so speed 10 gives the 700ms it shipped with, 20 halves it and
 * 1 stretches it to seven seconds.
 */
const UP_MS_AT_SPEED_ONE = 7_000;

/** Turns what the URL asked for into what the cycle runs on. */
export function cycleOptionsFor(settings: BoardScrollSettings): ScrollCycleOptions {
  return {
    holdTopMs: settings.delayFromStart * 1_000,
    holdBottomMs: settings.delayAtEnd * 1_000,
    downPxPerSec: settings.speed * PX_PER_SEC_PER_STEP,
    upMs: UP_MS_AT_SPEED_ONE / settings.speedUp,
    minDownMs: (MIN_DOWN_MS_AT_DEFAULT_SPEED * SCROLL_DEFAULTS.speed) / settings.speed,
  };
}

export interface ScrollCycleOptions {
  /** Time at the top before setting off — long enough to read the podium. */
  holdTopMs?: number;
  /** Time at the bottom before returning. */
  holdBottomMs?: number;
  /** Descent speed. Slow: this is being read, not skimmed. */
  downPxPerSec?: number;
  /** The trip back up. One movement, not a second reading pass. */
  upMs?: number;
  /** Floor on the descent, so a barely-scrolling board still eases. */
  minDownMs?: number;
}

/** Gentle at both ends: no lurch away from the top, no slam into the bottom. */
function easeInOut(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function prefersReducedMotion(): boolean {
  // Guarded: jsdom and older browsers do not always provide matchMedia.
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * Starts the cycle. Returns the stop function — call it on unmount, or the
 * timers outlive the page and scroll whatever replaced it.
 */
export function startBoardScrollCycle(options: ScrollCycleOptions = {}): () => void {
  const {
    holdTopMs = 10_000,
    holdBottomMs = 5_000,
    downPxPerSec = 90,
    upMs = 700,
    minDownMs = 4_000,
  } = options;

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let frame: number | undefined;

  /** How far this document can scroll right now — it grows as results land. */
  const scrollableDistance = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const wait = (ms: number, then: () => void) => {
    timer = setTimeout(() => {
      if (!stopped) then();
    }, ms);
  };

  const animateTo = (to: number, duration: number, done: () => void) => {
    const from = window.scrollY;
    const delta = to - from;

    // Anyone who has asked for less motion gets the same tour without the
    // travelling: the board still shows its whole length, it just cuts.
    if (delta === 0 || prefersReducedMotion()) {
      window.scrollTo(0, to);
      done();
      return;
    }

    const started = performance.now();
    const step = (now: number) => {
      if (stopped) return;
      const progress = Math.min(1, (now - started) / duration);
      window.scrollTo(0, from + delta * easeInOut(progress));
      if (progress < 1) frame = requestAnimationFrame(step);
      else done();
    };
    frame = requestAnimationFrame(step);
  };

  const cycle = () => {
    wait(holdTopMs, () => {
      const distance = scrollableDistance();
      // Nothing to show below the fold yet. Check again next time round rather
      // than giving up — the board fills as the race runs.
      if (distance <= 0) {
        cycle();
        return;
      }
      const downMs = Math.max(minDownMs, (distance / downPxPerSec) * 1000);
      animateTo(distance, downMs, () => {
        wait(holdBottomMs, () => {
          animateTo(0, upMs, cycle);
        });
      });
    });
  };

  cycle();

  return () => {
    stopped = true;
    if (timer !== undefined) clearTimeout(timer);
    if (frame !== undefined) cancelAnimationFrame(frame);
  };
}
