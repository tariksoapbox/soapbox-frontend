/** Every cache key in one place, so an invalidation can never miss a consumer. */
export const queryKeys = {
  session: ['session'] as const,
  ballot: ['judge', 'ballot'] as const,
  standings: ['standings'] as const,
  teams: ['teams'] as const,
  users: ['admin', 'users'] as const,
  scoreMatrix: ['admin', 'scores'] as const,
};

/**
 * How often the live views re-poll the API, in milliseconds.
 *
 * Polling, not a socket: the board must survive a proxy hop, a sleeping free-tier
 * instance and a phone on flaky 4G at a race track, and a refetch that fails
 * simply retries three seconds later. Three seconds is well inside the time it
 * takes a person to read a row.
 */
export const LIVE_REFETCH_MS = 3000;
