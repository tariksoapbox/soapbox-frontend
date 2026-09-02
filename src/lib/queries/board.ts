'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicStandings } from '@/lib/api/board';
import { queryKeys, BOARD_REFETCH_MS } from './keys';

/**
 * The public scoreboard feed.
 *
 * Refreshes once a minute (`BOARD_REFETCH_MS`). `placeholderData` keeps the
 * last board on screen while the next poll is in flight, so a refresh never
 * blanks a screen somebody is reading.
 */
export function usePublicBoard() {
  return useQuery({
    queryKey: queryKeys.publicBoard,
    queryFn: getPublicStandings,
    refetchInterval: BOARD_REFETCH_MS,
    placeholderData: (previous) => previous,
  });
}
