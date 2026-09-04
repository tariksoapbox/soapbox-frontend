'use client';

import { Stack, Typography } from '@mui/material';
import { formatPlace } from '@/lib/format';
import { standings as copy } from '@/content/standings';
import type { TimeStanding } from '@/schemas/contracts';

/**
 * The run-time column: the clock reading and the place it earns.
 *
 * A team that could not finish shows DNF with its place beside it, because that
 * is a result — last, shared with anyone else who retired. Only a team that has
 * not run yet shows a dash and no place.
 */
export function TimeCell({ time }: { time: TimeStanding }) {
  if (time.ms === null && !time.didNotFinish) {
    return (
      <Typography variant="caption" sx={{ color: 'brand.pending' }}>
        {copy.noTime}
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }}>
      <Typography
        variant="numeric"
        sx={{ fontSize: 18, color: time.didNotFinish ? 'text.secondary' : undefined }}
      >
        {time.formatted}
      </Typography>
      <Typography
        variant="numeric"
        sx={{ fontSize: 13, color: time.rank === 1 ? 'brand.gold' : 'text.secondary' }}
      >
        {formatPlace(time.rank)}
      </Typography>
    </Stack>
  );
}
