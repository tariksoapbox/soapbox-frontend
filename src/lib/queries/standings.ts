'use client';

import { useQuery } from '@tanstack/react-query';
import { getStandings } from '@/lib/api/standings';
import { queryKeys, LIVE_REFETCH_MS } from './keys';

/** The live board. Every viewer sees a vote land within one poll interval. */
export function useStandings() {
  return useQuery({
    queryKey: queryKeys.standings,
    queryFn: getStandings,
    refetchInterval: LIVE_REFETCH_MS,
    // Keep the previous board on screen while the next poll is in flight, so
    // rows never blink out from under someone reading them.
    placeholderData: (previous) => previous,
  });
}
