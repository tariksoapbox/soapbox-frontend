'use client';

import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { PlaceBadge } from './PlaceBadge';
import { CriterionCell } from './CriterionCell';
import { TimeCell } from './TimeCell';
import { criteriaShort } from '@/content/common';
import { standings as copy } from '@/content/standings';
import type { Standings } from '@/schemas/contracts';

/**
 * The board, as a table — the desktop / projector view. Three criterion
 * columns, each with its own place, then the sum and the overall place.
 *
 * On narrow screens `StandingsCards` renders the same data instead; a table this
 * wide cannot be made to work at 375px without hiding the very columns that
 * explain the result.
 */
export function StandingsTable({ data }: { data: Standings }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 72 }}>{copy.place}</TableCell>
            <TableCell sx={{ width: 56 }}>{copy.bib}</TableCell>
            <TableCell>{copy.team}</TableCell>
            <TableCell align="right">{criteriaShort.vehicle}</TableCell>
            <TableCell align="right">{criteriaShort.performance}</TableCell>
            <TableCell align="right">{criteriaShort.time}</TableCell>
            <TableCell align="right" sx={{ width: 88 }}>
              {copy.sum}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.teams.map((team) => (
            <TableRow
              key={team.id}
              sx={{
                '&:hover': { bgcolor: 'brand.rowHover' },
                // A row still missing an input reads as a preview, not a result.
                opacity: team.placementSum === null ? 0.75 : 1,
              }}
            >
              <TableCell>
                <PlaceBadge rank={team.overallRank} />
              </TableCell>
              <TableCell>
                <Typography variant="numeric" sx={{ color: 'text.secondary' }}>
                  {team.bibNumber ?? '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 600 }}>{team.name}</Typography>
                  {!team.final && (
                    <Chip
                      label={copy.provisional}
                      size="small"
                      sx={{ bgcolor: 'brand.elevated', color: 'brand.pending', fontSize: 11 }}
                    />
                  )}
                </Stack>
              </TableCell>
              <TableCell align="right">
                <CriterionCell cell={team.vehicle} expectedJudges={data.expectedJudges} />
              </TableCell>
              <TableCell align="right">
                <CriterionCell cell={team.performance} expectedJudges={data.expectedJudges} />
              </TableCell>
              <TableCell align="right">
                <TimeCell time={team.time} />
              </TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: 'inline-grid',
                    placeItems: 'center',
                    minWidth: 44,
                    py: 0.5,
                    px: 1,
                    borderRadius: 1.5,
                    bgcolor: 'brand.elevated',
                  }}
                >
                  <Typography variant="display" sx={{ fontSize: 20 }}>
                    {team.placementSum ?? '—'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
