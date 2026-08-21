/** Presentation helpers. Pure — no React, no API, directly unit-tested. */

/** `HH:mm:ss` in the viewer's own timezone; used for "updated at" and "sent at". */
export function formatClock(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Bosnian ordinal for a placement. The language marks it with a full stop —
 * "1." reads as *prvi* — so this is deliberately not the English "1st".
 */
export function formatPlace(rank: number | null): string {
  return rank === null ? '—' : `${rank}.`;
}

/**
 * "5/5 sudija" needs the right plural: Bosnian picks one form for 1, another
 * for 2–4, and a third for 0 and 5+, with the teens always taking the last.
 */
export function pluralBs(n: number, one: string, few: string, many: string): string {
  const lastTwo = Math.abs(n) % 100;
  const last = Math.abs(n) % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

/** e.g. `3 sudije`, `5 sudija`, `1 sudija`. */
export function judgeCount(n: number): string {
  return `${n} ${pluralBs(n, 'sudija', 'sudije', 'sudija')}`;
}
