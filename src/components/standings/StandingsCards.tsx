'use client';

import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { PlaceBadge } from './PlaceBadge';
import { CriterionCell } from './CriterionCell';
import { TimeCell } from './TimeCell';
import { criteriaShort } from '@/content/common';
import { standings as copy } from '@/content/standings';
import type { Standings } from '@/schemas/contracts';

/** The same board at phone width, where the table's seven columns cannot fit. */
export function StandingsCards({ data }: { data: Standings }) {
  return (
    <Stack spacing={1.5}>
      {data.teams.map((team) => (
        <Card key={team.id} sx={{ opacity: team.placementSum === null ? 0.8 : 1 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <PlaceBadge rank={team.overallRank} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{team.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {team.bibNumber !== null ? `${copy.bib} ${team.bibNumber}` : copy.team}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="display" sx={{ fontSize: 22 }}>
                  {team.placementSum ?? '—'}
                </Typography>
                <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block' }}>
                  {copy.sum}
                </Typography>
              </Box>
            </Stack>

            {!team.final && (
              <Chip
                label={copy.provisional}
                size="small"
                sx={{ mt: 1, bgcolor: 'brand.elevated', color: 'brand.pending', fontSize: 11 }}
              />
            )}

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={1}>
              {(
                [
                  [
                    criteriaShort.vehicle,
                    <CriterionCell
                      key="v"
                      cell={team.vehicle}
                      expectedJudges={data.expectedJudges}
                    />,
                  ],
                  [
                    criteriaShort.performance,
                    <CriterionCell
                      key="p"
                      cell={team.performance}
                      expectedJudges={data.expectedJudges}
                    />,
                  ],
                  [criteriaShort.time, <TimeCell key="t" time={team.time} />],
                ] as const
              ).map(([label, cell]) => (
                <Stack
                  key={label}
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {label}
                  </Typography>
                  {cell}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
