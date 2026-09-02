'use client';

import { Box, Typography } from '@mui/material';
import { board as copy } from '@/content/standings';
import { boardDisplayFont } from '@/theme';
import type { PublicTeam } from '@/schemas/contracts';

/**
 * One competitor on the public scoreboard.
 *
 * The row arrives by opening outward from its own centre — a `clip-path` inset
 * that starts closed at 50/50 and releases to both edges — rather than sliding
 * in from the left. It reads like something passing the camera rather than a
 * list being populated, which is the point on a screen at a racetrack.
 *
 * The animation runs once, on mount. The board polls every few seconds and
 * React keeps these nodes across polls, so a refresh updates the numbers
 * without replaying the entrance.
 */
export function BoardRow({ team, index }: { team: PublicTeam; index: number }) {
  const podium = team.rank !== null && team.rank <= 3;

  return (
    <Box
      data-testid="board-row"
      sx={{
        // Staggered so the field arrives as a sequence rather than a block, and
        // capped so a long start list does not keep the last row waiting.
        animation: 'boardRowIn 620ms cubic-bezier(.22,.9,.3,1) both',
        animationDelay: `${Math.min(index, 12) * 55}ms`,
        '@keyframes boardRowIn': {
          from: { clipPath: 'inset(0 50% 0 50%)', opacity: 0 },
          to: { clipPath: 'inset(0 0% 0 0%)', opacity: 1 },
        },
        // Anyone who has asked their system not to animate gets the board at once.
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '58px 1fr 88px', md: '76px 1fr repeat(3, 108px) 124px' },
          alignItems: 'center',
          gap: { xs: 1.5, md: 2.5 },
          px: { xs: 2, md: 3.5 },
          py: { xs: 2, md: 2.5 },
          borderRadius: 2,
          // Tokens, not literals: the light variant is a palette swap, so a
          // hard-coded white here would be invisible on a white page.
          bgcolor: podium ? 'brand.boardPodiumBg' : 'brand.boardRowBg',
          border: 1,
          borderColor: podium ? 'brand.boardPodiumBorder' : 'brand.boardRowBorder',
          position: 'relative',
          overflow: 'hidden',
          // One red edge on the leaders — the single flourish, and it marks
          // something the number already says.
          '&::before': podium
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                bgcolor: 'primary.main',
              }
            : undefined,
        }}
      >
        <Position rank={team.rank} podium={podium} />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: boardDisplayFont,
              fontWeight: 700,
              textTransform: 'uppercase',
              // Condensed takes the extra size without costing width, so the
              // name stays the largest thing in the row after the total.
              fontSize: { xs: 24, md: 34 },
              letterSpacing: '.01em',
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {team.name}
          </Typography>
          {team.bibNumber !== null && (
            <Typography
              sx={{ color: 'text.secondary', letterSpacing: '.08em', fontSize: { xs: 12, md: 14 } }}
            >
              #{team.bibNumber}
            </Typography>
          )}
        </Box>

        <Metric label={copy.vehicle} value={team.vehicle.total} />
        <Metric label={copy.performance} value={team.performance.total} />
        <Metric label={copy.time} value={team.time.formatted ?? copy.noTime} />

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              fontFamily: boardDisplayFont,
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              fontSize: { xs: 30, md: 46 },
              lineHeight: 1,
              color: podium ? 'primary.light' : 'text.primary',
            }}
          >
            {team.placementSum ?? copy.noTime}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', letterSpacing: '.1em', textTransform: 'uppercase' }}
          >
            {copy.sum}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/** The placing badge. Colour follows the number; it never replaces it. */
function Position({ rank, podium }: { rank: number | null; podium: boolean }) {
  return (
    <Box
      sx={{
        width: { xs: 48, md: 62 },
        height: { xs: 48, md: 62 },
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1.5,
        bgcolor: podium ? 'primary.main' : 'brand.elevated',
        border: 1,
        borderColor: podium ? 'primary.main' : 'divider',
      }}
    >
      <Typography
        sx={{
          fontFamily: boardDisplayFont,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          fontSize: { xs: 24, md: 32 },
          lineHeight: 1,
          color: podium ? 'primary.contrastText' : 'text.secondary',
        }}
      >
        {rank ?? '–'}
      </Typography>
    </Box>
  );
}

/** One number with its label. Hidden on phones, where the sum is what matters. */
function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
      <Typography
        sx={{
          fontFamily: boardDisplayFont,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', letterSpacing: '.1em', textTransform: 'uppercase' }}
      >
        {label}
      </Typography>
    </Box>
  );
}
