import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cycleOptionsFor, startBoardScrollCycle, SCROLL_DEFAULTS } from './boardScroll';

/**
 * The cycle is timers plus animation frames, so the clock is faked and frames
 * are driven by hand. `runFrames` advances both together, which is what a real
 * browser does and what makes the eased positions come out deterministic.
 */
let now = 0;
let frames: Array<{ id: number; fn: FrameRequestCallback }> = [];
let nextFrameId = 1;
let scrollY = 0;
let scrollHeight = 3000;

function runFrames(count: number, msPerFrame = 16) {
  for (let i = 0; i < count; i += 1) {
    now += msPerFrame;
    vi.setSystemTime(now);
    const due = frames;
    frames = [];
    for (const f of due) f.fn(now);
  }
}

beforeEach(() => {
  now = 0;
  frames = [];
  nextFrameId = 1;
  scrollY = 0;
  scrollHeight = 3000;
  vi.useFakeTimers();

  vi.stubGlobal('performance', { now: () => now });
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
    const id = nextFrameId++;
    frames.push({ id, fn });
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames = frames.filter((f) => f.id !== id);
  });

  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => 1000 });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  });
  window.scrollTo = ((_x: number, y: number) => {
    scrollY = y;
  }) as typeof window.scrollTo;
  window.matchMedia = ((q: string) => ({ matches: false, media: q })) as typeof window.matchMedia;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('startBoardScrollCycle', () => {
  it('holds at the top before it sets off', () => {
    const stop = startBoardScrollCycle();
    vi.advanceTimersByTime(9_999);
    runFrames(1);
    expect(scrollY).toBe(0);
    stop();
  });

  it('eases down the whole list, waits, then returns to the top', () => {
    const stop = startBoardScrollCycle();

    vi.advanceTimersByTime(10_000);
    // 2000px of travel at 90px/s is a little over 22 seconds.
    runFrames(200, 120);
    expect(scrollY).toBe(2000);

    // It sits at the bottom rather than snapping back the moment it lands.
    vi.advanceTimersByTime(4_999);
    runFrames(1);
    expect(scrollY).toBe(2000);

    vi.advanceTimersByTime(1);
    runFrames(100);
    expect(scrollY).toBe(0);

    stop();
  });

  it('starts gently — a tenth of the time covers well under a tenth of the list', () => {
    // The distinction between an ease and a constant crawl, asserted rather
    // than assumed: at 10% of the duration a linear scroll would be at 200px.
    const stop = startBoardScrollCycle({ holdTopMs: 0, downPxPerSec: 100, minDownMs: 0 });
    vi.advanceTimersByTime(0);
    runFrames(1, 2_000); // 2s of a 20s descent
    expect(scrollY).toBeGreaterThan(0);
    expect(scrollY).toBeLessThan(100);
    stop();
  });

  it('comes back up faster than it went down', () => {
    const stop = startBoardScrollCycle();
    vi.advanceTimersByTime(10_000);
    runFrames(200, 120);
    vi.advanceTimersByTime(5_000);

    // The whole return trip inside one second; the descent took twenty.
    runFrames(70, 16);
    expect(scrollY).toBe(0);
    stop();
  });

  it('loops', () => {
    const stop = startBoardScrollCycle();
    for (let lap = 0; lap < 2; lap += 1) {
      vi.advanceTimersByTime(10_000);
      runFrames(200, 120);
      expect(scrollY).toBe(2000);
      vi.advanceTimersByTime(5_000);
      runFrames(100);
      expect(scrollY).toBe(0);
    }
    stop();
  });

  it('waits for a board worth scrolling instead of giving up on a short one', () => {
    // The race starts with three teams on screen and fills up.
    scrollHeight = 900;
    const stop = startBoardScrollCycle();
    vi.advanceTimersByTime(10_000);
    runFrames(5);
    expect(scrollY).toBe(0);

    scrollHeight = 3000;
    vi.advanceTimersByTime(10_000);
    runFrames(200, 120);
    expect(scrollY).toBe(2000);
    stop();
  });

  it('cuts rather than travels when the display asks for less motion', () => {
    window.matchMedia = ((q: string) => ({ matches: true, media: q })) as typeof window.matchMedia;
    const stop = startBoardScrollCycle();
    vi.advanceTimersByTime(10_000);
    // No frames run at all: the jump happens on the timer.
    expect(scrollY).toBe(2000);
    vi.advanceTimersByTime(5_000);
    expect(scrollY).toBe(0);
    stop();
  });

  it('survives a browser without matchMedia', () => {
    // @ts-expect-error — deliberately removing it.
    delete window.matchMedia;
    const stop = startBoardScrollCycle();
    vi.advanceTimersByTime(10_000);
    runFrames(200, 120);
    expect(scrollY).toBe(2000);
    stop();
  });

  it('stops dead when told to, mid-descent', () => {
    const stop = startBoardScrollCycle();
    vi.advanceTimersByTime(10_000);
    runFrames(5, 120);
    const abandoned = scrollY;
    expect(abandoned).toBeGreaterThan(0);

    stop();
    runFrames(50, 120);
    vi.advanceTimersByTime(60_000);
    runFrames(50, 120);
    // Nothing moved after the stop — no timer outlived the page.
    expect(scrollY).toBe(abandoned);
  });

  it('stops while holding, before any frame is queued', () => {
    const stop = startBoardScrollCycle();
    stop();
    vi.advanceTimersByTime(60_000);
    runFrames(20);
    expect(scrollY).toBe(0);
  });
});

describe('cycleOptionsFor', () => {
  it('reproduces the shipped pace at the default speed', () => {
    // The whole point of putting 10 in the middle of the scale: a URL with no
    // numbers on it behaves exactly as the board did before they existed.
    expect(cycleOptionsFor(SCROLL_DEFAULTS)).toEqual({
      holdTopMs: 10_000,
      holdBottomMs: 5_000,
      downPxPerSec: 90,
      upMs: 700,
      minDownMs: 4_000,
    });
  });

  it('reads the scale linearly at both ends', () => {
    expect(cycleOptionsFor({ ...SCROLL_DEFAULTS, speed: 1 }).downPxPerSec).toBe(9);
    expect(cycleOptionsFor({ ...SCROLL_DEFAULTS, speed: 20 }).downPxPerSec).toBe(180);
  });

  it('turns the delays into milliseconds', () => {
    const o = cycleOptionsFor({ speed: 10, speedUp: 10, delayFromStart: 3, delayAtEnd: 20 });
    expect(o.holdTopMs).toBe(3_000);
    expect(o.holdBottomMs).toBe(20_000);
  });

  it('does not let the ease floor fight a fast setting', () => {
    // A short board at speed 20 should be quick. A fixed 4s floor would make it
    // slower than the same board at speed 10.
    expect(cycleOptionsFor({ ...SCROLL_DEFAULTS, speed: 20 }).minDownMs).toBe(2_000);
    expect(cycleOptionsFor({ ...SCROLL_DEFAULTS, speed: 5 }).minDownMs).toBe(8_000);
  });

  it('scales the return trip without letting it depend on the board length', () => {
    // A duration, not a pace: coming back is one movement, so it should not get
    // longer just because more teams have run.
    expect(cycleOptionsFor({ ...SCROLL_DEFAULTS, speedUp: 20 }).upMs).toBe(350);
    expect(cycleOptionsFor({ ...SCROLL_DEFAULTS, speedUp: 1 }).upMs).toBe(7_000);
  });

  it('keeps the two speeds independent', () => {
    const o = cycleOptionsFor({ ...SCROLL_DEFAULTS, speed: 1, speedUp: 20 });
    // Crawl down, snap back — a perfectly reasonable thing to ask for.
    expect(o.downPxPerSec).toBe(9);
    expect(o.upMs).toBe(350);
  });
});
