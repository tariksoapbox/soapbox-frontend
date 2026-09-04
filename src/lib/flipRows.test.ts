import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { measureRows, playRowMoves, FLIP_MS } from './flipRows';

/**
 * jsdom has no layout, so every row's rect is zero. Positions are stubbed per
 * element instead — which is exactly what the real code reads.
 */
const tops = new Map<HTMLElement, number>();

function makeBoard(ids: string[]): HTMLElement {
  const container = document.createElement('div');
  for (const id of ids) {
    const row = document.createElement('div');
    row.dataset.teamId = id;
    row.getBoundingClientRect = () => ({ top: tops.get(row) ?? 0 }) as DOMRect;
    container.append(row);
  }
  document.body.append(container);
  return container;
}

function rowsOf(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-team-id]')];
}

/** Lays the rows out at 100px intervals in the order they currently appear. */
function layout(container: HTMLElement, spacing = 100): void {
  rowsOf(container).forEach((row, i) => tops.set(row, i * spacing));
}

beforeEach(() => {
  tops.clear();
  document.body.innerHTML = '';
  vi.stubGlobal('scrollY', 0);
  // Fake timers stand in for requestAnimationFrame too, so the invert and the
  // release can be observed as the two separate frames they really are.
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('measureRows', () => {
  it('is empty for a board that is not there', () => {
    expect(measureRows(null).size).toBe(0);
  });

  it('measures in document coordinates, not viewport', () => {
    // An unattended board is usually scrolling. Measuring against the viewport
    // would read the scroll as movement and animate every row on every update.
    const container = makeBoard(['a']);
    layout(container);
    const atRest = measureRows(container);

    vi.stubGlobal('scrollY', 500);
    tops.set(rowsOf(container)[0]!, -500); // same place on the page, scrolled
    const scrolled = measureRows(container);

    expect([...scrolled.values()]).toEqual([...atRest.values()]);
  });

  it('keeps the two copies of a looping board apart', () => {
    // Keyed by element, not by team id: in endless mode the same team appears
    // twice, and keying by id would give both copies one position.
    const container = makeBoard(['a', 'a']);
    layout(container);
    expect(measureRows(container).size).toBe(2);
  });
});

describe('playRowMoves', () => {
  it('does nothing without a board, or without a previous measurement', () => {
    const container = makeBoard(['a']);
    expect(playRowMoves(null, new Map())).toBe(0);
    expect(playRowMoves(container, new Map())).toBe(0);
  });

  it('leaves a board that has not re-ordered alone', () => {
    const container = makeBoard(['a', 'b']);
    layout(container);
    const before = measureRows(container);

    expect(playRowMoves(container, before)).toBe(0);
    expect(rowsOf(container)[0]!.style.transform).toBe('');
  });

  it('sends each row back to where it was, then releases it', () => {
    const container = makeBoard(['a', 'b']);
    layout(container);
    const before = measureRows(container);
    const [a, b] = rowsOf(container);

    // They swap: a drops 100px, b climbs 100px.
    tops.set(a!, 100);
    tops.set(b!, 0);

    expect(playRowMoves(container, before)).toBe(2);

    // Invert: both are pinned back where they were, with no transition, so
    // nothing has visibly happened yet.
    expect(a!.style.transform).toBe('translateY(-100px)');
    expect(b!.style.transform).toBe('translateY(100px)');
    expect(a!.style.transition).toBe('none');

    // Play: released on the next frame, and the browser animates the gap.
    vi.advanceTimersByTime(16);
    expect(a!.style.transition).toContain(`${FLIP_MS}ms`);
    expect(b!.style.transition).toContain(`${FLIP_MS}ms`);
    expect(a!.style.transform).toBe('');
    expect(b!.style.transform).toBe('');
  });

  it('draws the climbing row over the row it passes', () => {
    const container = makeBoard(['a', 'b']);
    layout(container);
    const before = measureRows(container);
    const [a, b] = rowsOf(container);
    tops.set(a!, 100);
    tops.set(b!, 0);

    playRowMoves(container, before);

    // Without this the team being overtaken paints on top, which reads as
    // exactly the wrong result.
    expect(Number(b!.style.zIndex)).toBeGreaterThan(Number(a!.style.zIndex));
  });

  it('puts the biggest climber above the smaller ones', () => {
    const container = makeBoard(['a', 'b', 'c', 'd']);
    layout(container);
    const before = measureRows(container);
    const [a, b, c, d] = rowsOf(container);
    // New order: c, a, d, b.
    tops.set(c!, 0); //   climbs two
    tops.set(a!, 100); // falls one
    tops.set(d!, 200); // climbs one
    tops.set(b!, 300); // falls two

    playRowMoves(container, before);

    // Two climbers of different reach, and the further one is on top of the
    // nearer one, which is on top of everything falling.
    expect(Number(c!.style.zIndex)).toBeGreaterThan(Number(d!.style.zIndex));
    expect(Number(d!.style.zIndex)).toBeGreaterThan(Number(a!.style.zIndex));
    expect(a!.style.zIndex).toBe('1');
    expect(b!.style.zIndex).toBe('1');
  });

  it('ignores a team that has only just arrived', () => {
    const container = makeBoard(['a']);
    layout(container);
    const before = measureRows(container);

    const fresh = document.createElement('div');
    fresh.dataset.teamId = 'new';
    fresh.getBoundingClientRect = () => ({ top: 100 }) as DOMRect;
    container.append(fresh);

    // It has nowhere to travel from, so it simply appears.
    expect(playRowMoves(container, before)).toBe(0);
  });

  it('clears up after itself, so nothing is left inline', () => {
    const container = makeBoard(['a', 'b']);
    layout(container);
    const before = measureRows(container);
    const [a, b] = rowsOf(container);
    tops.set(a!, 100);
    tops.set(b!, 0);

    playRowMoves(container, before);
    vi.advanceTimersByTime(FLIP_MS + 200);

    // A stale z-index or transition would quietly affect the next change.
    for (const row of [a!, b!]) {
      expect(row.style.transition).toBe('');
      expect(row.style.zIndex).toBe('');
      expect(row.style.position).toBe('');
    }
  });

  it('re-orders without animating when less motion is asked for', () => {
    const container = makeBoard(['a', 'b']);
    layout(container);
    const before = measureRows(container);
    const [a, b] = rowsOf(container);
    tops.set(a!, 100);
    tops.set(b!, 0);

    // Still reports the move — the caller may want to know — but nothing on
    // the page is touched.
    expect(playRowMoves(container, before, { reducedMotion: true })).toBe(2);
    expect(a!.style.transform).toBe('');
    expect(a!.style.transition).toBe('');
  });

  it('does not let a finished animation strip a running one', () => {
    // Two saves inside 620ms is ordinary for an admin working quickly. The
    // first animation's cleanup used to fire part-way through the second and
    // take its transition with it, so the row snapped instead of travelling.
    const container = makeBoard(['a', 'b']);
    layout(container);
    const first = measureRows(container);
    const [a, b] = rowsOf(container);

    tops.set(a!, 100);
    tops.set(b!, 0);
    playRowMoves(container, first);
    vi.advanceTimersByTime(16);

    // Half way through, a second change arrives.
    vi.advanceTimersByTime(300);
    const second = measureRows(container);
    tops.set(a!, 0);
    tops.set(b!, 100);
    playRowMoves(container, second);
    vi.advanceTimersByTime(16);

    // The first cleanup would have landed about here.
    vi.advanceTimersByTime(400);
    expect(a!.style.transition).toContain(`${FLIP_MS}ms`);
    expect(a!.style.zIndex).not.toBe('');

    // And the second one still tidies up after itself.
    vi.advanceTimersByTime(FLIP_MS + 200);
    expect(a!.style.transition).toBe('');
    expect(a!.style.zIndex).toBe('');
  });
});
