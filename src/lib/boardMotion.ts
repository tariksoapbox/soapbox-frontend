/**
 * One duration and one curve for everything that moves on the board.
 *
 * The board has four effects — a row arriving, a row travelling to a new place,
 * a row whose numbers changed, and the red wash coming up — and they are often
 * on screen together. Given their own timings they read as four unrelated
 * things happening at once; sharing these they read as one board reacting.
 *
 * Change them here and every effect follows.
 */
export const BOARD_MOTION_MS = 620;

/** Quick to leave, gentle to arrive — the curve of something being placed. */
export const BOARD_EASING = 'cubic-bezier(.22,.9,.3,1)';
