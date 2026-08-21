'use client';

import { Box, Typography } from '@mui/material';
import { formatPlace } from '@/lib/format';

/**
 * A team's overall place. The podium colours are decorative — the number is
 * always right there, so colour never carries the meaning on its own.
 */
export function PlaceBadge({ rank }: { rank: number | null }) {
  const medal = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : null;

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        border: 2,
        borderColor: medal ? `brand.${medal}` : 'divider',
        bgcolor: medal ? 'brand.elevated' : 'transparent',
        color: medal ? `brand.${medal}` : 'text.secondary',
      }}
    >
      <Typography variant="numeric" sx={{ fontSize: 15, color: 'inherit' }}>
        {formatPlace(rank)}
      </Typography>
    </Box>
  );
}
