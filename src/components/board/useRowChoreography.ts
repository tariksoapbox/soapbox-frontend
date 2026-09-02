'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { measureRows, playRowMoves, type RowPositions } from '@/lib/flipRows';
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

    // Ready for the next change, whenever it lands.
    previous.current = measureRows(container.current);
  }, [container, teams]);
}
