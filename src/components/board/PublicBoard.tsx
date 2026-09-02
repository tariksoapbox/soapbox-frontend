'use client';

import { Box, CircularProgress, Container, Stack, ThemeProvider, Typography } from '@mui/material';
import { BoardRow } from './BoardRow';
import { board as copy } from '@/content/standings';
import { usePublicBoard } from '@/lib/queries/board';
import { boardDisplayFont, darkBoardTheme, lightBoardTheme } from '@/theme';

/**
 * The scoreboard as an audience sees it: a screen at the venue, or a link
 * shared with spectators.
 *
 * Deliberately restrained. One accent colour, one animation, big numbers, and a
 * lot of space — a board is read from across a room and in a photograph, so
 * anything that competes with the standings is working against it.
 */
export function PublicBoard({
  variant = 'dark',
  fontClassName,
}: {
  variant?: 'dark' | 'light';
  /**
   * Carries the Futura CSS variables. Declared by the page, because
   * `next/font/local` cannot be called from a client component — and passed in
   * rather than set globally so only this page loads the files.
   */
  fontClassName?: string;
}) {
  const { data, isPending, error } = usePublicBoard();
  const light = variant === 'light';

  return (
    <ThemeProvider theme={light ? lightBoardTheme : darkBoardTheme}>
      <Box
        className={fontClassName}
        sx={{
          minHeight: '100dvh',
          // One wash of red off the top, so the page reads as branded without a
          // logo and without decorating the data.
          bgcolor: 'background.default',
          // One wash of red off the top so the page reads as branded without a
          // logo. Lighter on the white variant, where the same strength would
          // turn the top of the page pink.
          background: (t) =>
            `radial-gradient(120% 70% at 50% -20%, ${t.palette.primary.dark}${light ? '14' : '44'} 0%, transparent 62%)`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: { xs: 3, md: 5 } }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: boardDisplayFont,
                fontWeight: 700,
                textTransform: 'uppercase',
                // Futura Condensed carries a larger size in the same width, and
                // wants tracking opened rather than tightened.
                fontSize: { xs: 40, md: 64 },
                letterSpacing: '.01em',
                lineHeight: 0.95,
              }}
            >
              {copy.title}
            </Typography>
            <Typography
              sx={{
                mt: 1,
                color: 'text.secondary',
                letterSpacing: '.2em',
                textTransform: 'uppercase',
                fontSize: 12,
              }}
            >
              {copy.subtitle}
            </Typography>
          </Box>

          {isPending && !data ? (
            <Box
              sx={{ py: 10, display: 'grid', placeItems: 'center' }}
              role="status"
              aria-live="polite"
            >
              {/* No caption: the spinner says it, and a line of text that only
                exists for a second is one more thing on a board that should
                only ever show standings. It carries the wording as its label
                so a screen reader still gets it. */}
              <CircularProgress
                color="primary"
                aria-label={copy.waiting}
                size={64}
                thickness={3}
                sx={{ width: { xs: 48, md: 64 }, height: { xs: 48, md: 64 } }}
              />
            </Box>
          ) : (
            <Stack spacing={{ xs: 1.25, md: 1.75 }}>
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
    </ThemeProvider>
  );
}
