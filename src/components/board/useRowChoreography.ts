'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { FLIP_MS, measureRows, playRowMoves, type RowPositions } from '@/lib/flipRows';
import type { PublicTeam } from '@/schemas/contracts';

/**
 * Makes a re-ordered board move rather than jump.
 *
 * `container` should be the element holding every row on the page — in endless
 * mode that is both copies, which both need to move or the one being read will
 * jump while the other slides.
 *
 * The measurement has to happen before the browser paints the new order, which
 * is what `useLayoutEffect` is for: by the time it runs React has swapped the
 * rows, so the previous positions must already be in hand. They are taken from
 * the render before, kept in a ref.
 */
export function useRowChoreography(
  container: RefObject<HTMLElement | null>,
  teams: PublicTeam[] | undefined,
): void {
  const previous = useRef<RowPositions>(new Map());
  const order = useRef<string>('');
  const resettle = useRef<number>(undefined);

  useLayoutEffect(() => {
    const next = teams?.map((t) => t.id).join(',') ?? '';
    const reordered = order.current !== '' && next !== order.current;
    order.current = next;

    if (reordered) {
      playRowMoves(container.current, previous.current, {
        reducedMotion:
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      });
    }

    // Where the rows are now, ready for the next change.
    //
    // Taken again once the travel has finished, because at this instant a row
    // that is moving has just been pinned back to where it started — measuring
    // only here would record the position it left, and the next change would
    // then animate from a place the row is no longer in. Two reorders in a row
    // with nothing between them is exactly what a fast scorer produces.
    previous.current = measureRows(container.current);
    window.clearTimeout(resettle.current);
    if (reordered) {
      resettle.current = window.setTimeout(() => {
        previous.current = measureRows(container.current);
      }, FLIP_MS + 80);
    }
  }, [container, teams]);

  // Nothing may fire into a board that has gone away.
  useEffect(() => () => window.clearTimeout(resettle.current), []);
}
