'use client';

import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CriterionBallot } from './CriterionBallot';
import { criteria } from '@/content/common';
import { judge as copy } from '@/content/judge';
import { CRITERIA, type BallotTeam, type Criterion } from '@/schemas/contracts';

export interface SubmittingCell {
  teamId: string;
  criterion: Criterion;
}

/** One team, with both of this judge's criteria. */
export function TeamBallotCard({
  team,
  onSubmit,
  submitting,
  error,
}: {
  team: BallotTeam;
  onSubmit: (criterion: Criterion, points: number) => void;
  submitting: SubmittingCell | null;
  error: { cell: SubmittingCell; error: unknown } | null;
}) {
  const done = CRITERIA.every((c) => team[c].points !== null);

  return (
    <Card
      sx={{
        // A finished team steps back so the eye lands on what is still open.
        opacity: done ? 0.72 : 1,
        borderColor: done ? 'divider' : 'brand.fieldBorder',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {team.bibNumber !== null && (
            <Box
              aria-label={copy.bib(team.bibNumber)}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'brand.elevated',
                border: 1,
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Typography variant="numeric" sx={{ fontSize: 18 }}>
                {team.bibNumber}
              </Typography>
            </Box>
          )}
          <Typography variant="h3" component="h2" sx={{ flex: 1, minWidth: 0 }}>
            {team.name}
          </Typography>
          {done && (
            <Chip
              icon={<CheckCircleIcon />}
              label={copy.submitted}
              size="small"
              sx={{
                bgcolor: 'brand.elevated',
                color: 'success.main',
                '& .MuiChip-icon': { color: 'success.main' },
              }}
            />
          )}
        </Stack>

        <Stack spacing={3} sx={{ mt: 2.5 }} divider={<Divider flexItem />}>
          {CRITERIA.map((criterion) => (
            <CriterionBallot
              key={criterion}
              criterion={criterion}
              label={criteria[criterion]}
              cell={team[criterion]}
              onSubmit={(points) => onSubmit(criterion, points)}
              isSubmitting={submitting?.teamId === team.id && submitting.criterion === criterion}
              error={
                error?.cell.teamId === team.id && error.cell.criterion === criterion
                  ? error.error
                  : null
              }
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
