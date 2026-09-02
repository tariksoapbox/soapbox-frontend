'use client';

import { Box, Chip, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { BoardRow } from './BoardRow';
import { Brand } from '../Brand';
import { board as copy } from '@/content/standings';
import { formatClock } from '@/lib/format';
import { usePublicBoard } from '@/lib/queries/board';

/**
 * The scoreboard as an audience sees it: a screen at the venue, or a link
 * shared with spectators.
 *
 * Deliberately restrained. One accent colour, one animation, big numbers, and a
 * lot of space — a board is read from across a room and in a photograph, so
 * anything that competes with the standings is working against it.
 */
export function PublicBoard() {
  const { data, isPending, error } = usePublicBoard();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        // One wash of red off the top, so the page reads as branded without a
        // logo and without decorating the data.
        background: (t) =>
          `radial-gradient(120% 70% at 50% -20%, ${t.palette.primary.dark}44 0%, transparent 62%)`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { sm: 'flex-end' },
            justifyContent: 'space-between',
            mb: { xs: 3, md: 5 },
          }}
        >
          <Box>
            <Brand size="lg" />
            <Typography
              sx={{
                mt: 2,
                fontWeight: 700,
                fontSize: { xs: 30, md: 46 },
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {copy.title}
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                color: 'text.secondary',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                fontSize: 12,
              }}
            >
              {copy.subtitle}
            </Typography>
          </Box>

          {data && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                label={data.event.complete ? copy.eventComplete : copy.provisional}
                sx={{
                  bgcolor: data.event.complete ? 'primary.main' : 'brand.elevated',
                  color: data.event.complete ? 'primary.contrastText' : 'text.secondary',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  fontSize: 10.5,
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatClock(data.event.computedAt)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {isPending && !data ? (
          <Box
            sx={{ py: 10, display: 'grid', placeItems: 'center' }}
            role="status"
            aria-live="polite"
          >
            <CircularProgress color="primary" />
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>{copy.waiting}</Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {data?.teams.map((team, i) => (
              <BoardRow key={team.id} team={team} index={i} />
            ))}
          </Stack>
        )}

        {data?.teams.length === 0 && (
          <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
            {copy.empty}
          </Typography>
        )}

        {/* A poll that fails keeps the last board on screen; the note is the
            only signal that it is no longer moving. */}
        {error && data && (
          <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }} role="status">
            {copy.offline}
          </Typography>
        )}
        {error && !data && (
          <Typography sx={{ py: 8, textAlign: 'center', color: 'error.main' }} role="alert">
            {copy.offline}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
