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
