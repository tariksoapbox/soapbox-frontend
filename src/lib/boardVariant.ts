export type BoardVariant = 'dark' | 'light';

/**
 * Which scoreboard variant a URL is asking for.
 *
 * Kept deliberately forgiving: this is a link typed into a venue display or
 * pasted from a message, so case and stray spaces do not matter, and anything
 * unrecognised falls back to the dark board rather than showing an error page
 * to a room full of spectators.
 */
export function boardVariantFromUrl(value: string | string[] | undefined): BoardVariant {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase();
  if (!raw) return 'dark';
  return raw === 'light' || raw === 'white' ? 'light' : 'dark';
}
