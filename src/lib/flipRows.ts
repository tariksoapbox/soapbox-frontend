/**
 * FLIP for the scoreboard: rows travel to their new places instead of
 * teleporting.
 *
 * First, Last, Invert, Play. Measure where each row is, let React re-order the
 * DOM, measure again, then put every row back where it started with a
 * transform and release it. The browser animates the release, so what a
 * spectator sees is a team physically climbing past another rather than a list
 * that blinked into a different order.
 *
 * The rows that move up are drawn over the rows they pass. A team overtaking
 * another should look like it went over the top, and without that the loser of
 * the exchange paints on top of the winner — which reads exactly backwards.
 */

/** How long a row takes to travel, and the curve it travels on. */
export const FLIP_MS = 620;
const FLIP_EASING = 'cubic-bezier(.22,.9,.3,1)';

/** Below this, a row has effectively not moved and is left alone. */
const MIN_TRAVEL_PX = 1;

/**
 * Keyed by the element, not by the team.
 *
 * React reuses a keyed row's DOM node when it re-orders, so the node itself is
 * a stable identity across the change — and unlike a team id it stays unique
 * when the endless mode draws the whole board twice. Keying by id there would
 * give both copies of a team the same starting position and send one of them
 * the wrong way.
 */
export type RowPositions = Map<HTMLElement, number>;

/**
 * Where every row is right now, in document coordinates.
 *
 * Document, not viewport: an unattended board is usually scrolling, and a
 * viewport-relative measurement would read the scroll itself as movement and
 * animate every row on every update.
 */
export function measureRows(container: HTMLElement | null): RowPositions {
  const positions: RowPositions = new Map();
  if (!container) return positions;
  for (const row of container.querySelectorAll<HTMLElement>('[data-team-id]')) {
    positions.set(row, row.getBoundingClientRect().top + window.scrollY);
  }
  return positions;
}

/**
 * Animates each row from where it was to where it now is.
 *
 * Returns the number of rows that actually moved, which is what the caller
 * needs to know whether anything happened at all.
 */
export function playRowMoves(
  container: HTMLElement | null,
  before: RowPositions,
  options: { reducedMotion?: boolean } = {},
): number {
  if (!container || before.size === 0) return 0;

  const moves: Array<{ row: HTMLElement; travel: number }> = [];
  for (const row of container.querySelectorAll<HTMLElement>('[data-team-id]')) {
    const was = before.get(row);
    // A team that has just been added has nowhere to travel from.
    if (was === undefined) continue;
    const travel = was - (row.getBoundingClientRect().top + window.scrollY);
    if (Math.abs(travel) >= MIN_TRAVEL_PX) moves.push({ row, travel });
  }

  if (moves.length === 0) return 0;
  // Someone who has asked for less motion gets the new order, immediately.
  if (options.reducedMotion) return moves.length;

  // The furthest climber goes on top, so an overtake reads as one.
  const climbs = moves.filter((m) => m.travel > 0).sort((a, b) => b.travel - a.travel);

  for (const { row, travel } of moves) {
    row.style.transition = 'none';
    row.style.transform = `translateY(${travel}px)`;
    row.style.zIndex =
      travel > 0 ? String(10 + climbs.length - climbs.findIndex((c) => c.row === row)) : '1';
    row.style.position = 'relative';
  }

  // Read back a layout value to force the inverted position to be committed —
  // without it the browser coalesces both writes and nothing animates.
  void container.offsetHeight;

  requestAnimationFrame(() => {
    for (const { row } of moves) {
      row.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASING}`;
      row.style.transform = '';
    }
  });

  window.setTimeout(() => {
    for (const { row } of moves) {
      row.style.transition = '';
      row.style.transform = '';
      row.style.zIndex = '';
      row.style.position = '';
    }
  }, FLIP_MS + 60);

  return moves.length;
}
