/** Every cache key in one place, so an invalidation can never miss a consumer. */
export const queryKeys = {
  session: ['session'] as const,
  judges: ['admin', 'judges'] as const,
  apiKeys: ['admin', 'api-keys'] as const,
  standings: ['standings'] as const,
  publicBoard: ['public', 'standings'] as const,
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

/**
 * How often the PUBLIC scoreboard re-polls.
 *
 * A minute, not three seconds: an audience screen is read, not operated, and a
 * board whose numbers twitch every few seconds is harder to read than one that
 * settles. It also means a room full of phones costs the free-tier API twenty
 * times less traffic.
 */
export const BOARD_REFETCH_MS = 60_000;
