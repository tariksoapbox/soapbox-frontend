'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getBallot, submitScore } from '@/lib/api/judge';
import { queryKeys, LIVE_REFETCH_MS } from './keys';

/**
 * The judge's own ballot, re-polled so an admin clearing a mis-tapped score
 * re-opens that cell on the judge's phone without them reloading anything.
 */
export function useBallot() {
  return useQuery({
    queryKey: queryKeys.ballot,
    queryFn: getBallot,
    refetchInterval: LIVE_REFETCH_MS,
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitScore,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ballot });
      void queryClient.invalidateQueries({ queryKey: queryKeys.standings });
    },
  });
}
