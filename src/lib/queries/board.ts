'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicStandings } from '@/lib/api/board';
import { queryKeys, LIVE_REFETCH_MS } from './keys';

/**
 * The public scoreboard feed.
 *
 * `placeholderData` keeps the last board on screen while the next poll is in
 * flight — on a screen at the venue, rows blinking out every few seconds would
 * be far worse than data a moment stale.
 */
export function usePublicBoard() {
  return useQuery({
    queryKey: queryKeys.publicBoard,
    queryFn: getPublicStandings,
    refetchInterval: LIVE_REFETCH_MS,
    placeholderData: (previous) => previous,
  });
}
