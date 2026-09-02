'use client';

import {
  Box,
  CircularProgress,
  Container,
  GlobalStyles,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useEffect } from 'react';
import logo from '@/assets/soapbox-logo.webp';
import { BoardRow } from './BoardRow';
import { board as copy } from '@/content/standings';
import { usePublicBoard } from '@/lib/queries/board';
import {
  cycleOptionsFor,
  startBoardScrollCycle,
  SCROLL_DEFAULTS,
  type BoardScrollSettings,
} from '@/lib/boardScroll';
import type { Theme } from '@mui/material/styles';
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
  autoScroll = false,
  scrollSettings = SCROLL_DEFAULTS,
}: {
  variant?: 'dark' | 'light';
  /**
   * Carries the Futura CSS variables. Declared by the page, because
   * `next/font/local` cannot be called from a client component — and passed in
   * rather than set globally so only this page loads the files.
   */
  fontClassName?: string;
  /**
   * Walk the page down the standings and back, for a screen nobody is
   * standing at. Off by default — see `autoScrollFromUrl`.
   */
  autoScroll?: boolean;
  /** Pace and pauses for that cycle. Ignored unless `autoScroll` is on. */
  scrollSettings?: BoardScrollSettings;
}) {
  const { data, isPending, error } = usePublicBoard();
  const light = variant === 'light';

  // Started once, not per render: the cycle owns its own timers and the effect
  // returns the stopper, so nothing keeps scrolling after this unmounts.
  const { speed, delayFromStart, delayAtEnd } = scrollSettings;
  useEffect(() => {
    if (!autoScroll) return;
    // Depending on the three numbers rather than the object: a fresh object
    // every render would restart the cycle every render.
    return startBoardScrollCycle(cycleOptionsFor({ speed, delayFromStart, delayAtEnd }));
  }, [autoScroll, speed, delayFromStart, delayAtEnd]);

  return (
    <ThemeProvider theme={light ? lightBoardTheme : darkBoardTheme}>
      {/* CssBaseline styles the document from the console's theme — navy
        ground, white ink — and it does so through :root CSS variables that a
        nested provider cannot reach. The board restates both from its own
        palette, or the white variant renders white text on white and shows a
        navy edge on overscroll. */}
      <GlobalStyles
        styles={(t) => ({
          'html, body': {
            backgroundColor: t.palette.background.default,
            color: t.palette.text.primary,
            colorScheme: light ? 'light' : 'dark',
          },
        })}
      />
      <Box
        data-testid="board-root"
        // Explicit, so everything inside inherits the board's ink rather than
        // whatever the document happens to be set to.
        color="text.primary"
        className={fontClassName}
        sx={{
          minHeight: '100dvh',
          bgcolor: 'background.default',
          // A wash of red off the top. 10% on white — enough that the board is
          // obviously branded before you read a word of it, short of tinting
          // the numbers. The dark variant carries more because navy swallows it.
          background: (t: Theme) =>
            `radial-gradient(120% 70% at 50% -20%, ${t.palette.primary.dark}${light ? '1A' : '44'} 0%, transparent 62%)`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, md: 4 } }}>
          <Box
            data-testid="board-header"
            sx={{
              mb: { xs: 3, md: 5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
            }}
          >
            <Box>
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

            {/* The event's own mark, opposite its own standings. Sized by
              height so the two variants share one asset — it has a transparent
              ground and reads on the navy and on the white alike. */}
            <Box
              component={Image}
              src={logo}
              alt={copy.logoAlt}
              // The asset's own pixels, for the aspect ratio; CSS below decides
              // how big it actually draws. Stated rather than taken from the
              // import because the test renderer has no Next image loader.
              width={634}
              height={600}
              priority
              sx={{
                height: { xs: 56, md: 104 },
                width: 'auto',
                display: 'block',
                // The title wraps before the mark gives up any size.
                flexShrink: 0,
              }}
            />
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
