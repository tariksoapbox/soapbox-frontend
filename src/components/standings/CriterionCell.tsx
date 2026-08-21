'use client';

import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { formatPlace } from '@/lib/format';
import { standings as copy } from '@/content/standings';
import type { CriterionStanding } from '@/schemas/contracts';

/**
 * A points column: the total, the place it earns, and how many judges are in.
 *
 * The judge count is the honesty of the whole board — 27 out of three judges is
 * not comparable with 45 out of five, so the fraction is never hidden. It only
 * disappears once the column is complete, when it would be noise.
 */
export function CriterionCell({
  cell,
  expectedJudges,
}: {
  cell: CriterionStanding;
  expectedJudges: number;
}) {
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'flex-end' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typography variant="numeric" sx={{ fontSize: 18 }}>
          {cell.total}
        </Typography>
        <Tooltip title={copy.rank}>
          <Typography
            variant="numeric"
            sx={{ fontSize: 13, color: cell.rank === 1 ? 'brand.gold' : 'text.secondary' }}
          >
            {formatPlace(cell.rank)}
          </Typography>
        </Tooltip>
      </Stack>
      {!cell.complete && (
        <Box
          sx={{
            px: 0.75,
            borderRadius: 0.75,
            bgcolor: 'brand.elevated',
            color: 'brand.pending',
          }}
        >
          <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {copy.judgesOf(cell.judges, expectedJudges)}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
