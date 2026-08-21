'use client';

import { Alert, Box, Chip, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StandingsTable } from './StandingsTable';
import { StandingsCards } from './StandingsCards';
import { QueryState } from '../QueryState';
import { standings as copy } from '@/content/standings';
import { formatClock, judgeCount } from '@/lib/format';
import { useStandings } from '@/lib/queries/standings';

/**
 * The live board. Polls on an interval (see `LIVE_REFETCH_MS`) so a vote cast on
 * a judge's phone shows up here within seconds, on every screen watching.
 */
export function StandingsBoard() {
  const query = useStandings();
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const data = query.data;

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={copy.live}
            size="small"
            icon={
              <Box
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  ml: '8px !important',
                }}
              />
            }
            sx={{ bgcolor: 'brand.elevated', color: 'text.primary' }}
          />
          {data && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {copy.updatedAt(formatClock(data.computedAt))} · {judgeCount(data.expectedJudges)}
            </Typography>
          )}
        </Stack>
      </Stack>

      {data?.eventComplete && (
        <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
          {copy.eventComplete}
        </Alert>
      )}

      <QueryState
        // `placeholderData` keeps the last board on screen across polls, so only
        // the very first load is ever "pending".
        isPending={query.isPending}
        error={query.error}
        isEmpty={data?.teams.length === 0}
        emptyMessage={copy.empty}
        onRetry={() => void query.refetch()}
      >
        {data && (wide ? <StandingsTable data={data} /> : <StandingsCards data={data} />)}
      </QueryState>

      <Box
        component="section"
        aria-label={copy.legendTitle}
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          {copy.legendTitle}
        </Typography>
        <Stack component="ul" spacing={0.75} sx={{ m: 0, mt: 1, pl: 2.5 }}>
          {copy.legend.map((line) => (
            <Typography key={line} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
              {line}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
