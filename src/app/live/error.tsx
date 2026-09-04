'use client';

import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { board as copy } from '@/content/standings';

/**
 * The board's last line of defence.
 *
 * Without this, one thrown render takes the whole page to white — on a screen
 * in front of a crowd, with nobody near the machine. A crash here is not
 * something to explain to spectators, so the page says the least it can and
 * puts itself back together.
 *
 * The reload is on a timer rather than a button because there is no one to
 * press it, and Next's own `reset()` only re-renders: if the crash came from a
 * payload this build cannot read, re-rendering will simply crash again.
 */
export default function BoardError({ error }: { error: Error }) {
  useEffect(() => {
    console.error('[board] render failed:', error);
    const timer = window.setTimeout(() => window.location.reload(), 10_000);
    return () => window.clearTimeout(timer);
  }, [error]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 4,
      }}
      role="alert"
    >
      <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>{copy.offline}</Typography>
    </Box>
  );
}
