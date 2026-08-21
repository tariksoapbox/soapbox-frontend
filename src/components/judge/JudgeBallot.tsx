'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { TeamBallotCard, type SubmittingCell } from './TeamBallotCard';
import { QueryState } from '../QueryState';
import { judge as copy } from '@/content/judge';
import { useBallot, useSubmitScore } from '@/lib/queries/judge';
import { CRITERIA, type Criterion } from '@/schemas/contracts';

type Filter = 'remaining' | 'all';

/**
 * The judge's whole screen: every team, in start order, with the two criteria
 * they own. Defaults to the teams still waiting on them, because during a race
 * "what do I still have to do" is the only question worth answering fast.
 */
export function JudgeBallot() {
  const ballot = useBallot();
  const submit = useSubmitScore();
  const [filter, setFilter] = useState<Filter>('remaining');
  const [pending, setPending] = useState<SubmittingCell | null>(null);
  const [failure, setFailure] = useState<{ cell: SubmittingCell; error: unknown } | null>(null);

  const teams = ballot.data?.teams ?? [];
  const open = teams.filter((t) => CRITERIA.some((c) => t[c].points === null));
  const shown = filter === 'remaining' ? open : teams;

  function handleSubmit(teamId: string, criterion: Criterion, points: number) {
    const cell = { teamId, criterion };
    setPending(cell);
    setFailure(null);
    submit.mutate(
      { teamId, criterion, points },
      {
        onError: (error) => setFailure({ cell, error }),
        onSettled: () => setPending(null),
      },
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        {/* Only once the ballot has actually arrived — a default of 0 would read
            as "all done" for the whole first load. */}
        {ballot.data && (
          <Chip
            icon={ballot.data.remaining === 0 ? <CheckCircleIcon /> : undefined}
            label={
              ballot.data.remaining === 0 ? copy.allDone : copy.remaining(ballot.data.remaining)
            }
            sx={{
              alignSelf: 'flex-start',
              height: 36,
              px: 0.5,
              fontSize: 14,
              bgcolor: 'brand.elevated',
              color: ballot.data.remaining === 0 ? 'success.main' : 'text.primary',
              '& .MuiChip-icon': { color: 'success.main' },
            }}
          />
        )}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filter}
          onChange={(_e, next: Filter | null) => next && setFilter(next)}
          aria-label={copy.filterAll}
        >
          <ToggleButton value="remaining">{copy.filterRemaining}</ToggleButton>
          <ToggleButton value="all">{copy.filterAll}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Only while there is still something to cast — after that it is noise,
          and during a failed load it would sit above the actual error. */}
      {open.length > 0 && (
        <Alert severity="info" icon={<LockOutlinedIcon fontSize="inherit" />}>
          {copy.finalNotice}
        </Alert>
      )}

      <QueryState
        isPending={ballot.isPending}
        error={ballot.error}
        isEmpty={teams.length === 0}
        emptyMessage={copy.noTeams}
        onRetry={() => void ballot.refetch()}
      >
        {shown.length === 0 ? (
          <Box
            sx={{
              py: 6,
              px: 3,
              textAlign: 'center',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>{copy.noRemaining}</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {shown.map((team) => (
              <TeamBallotCard
                key={team.id}
                team={team}
                submitting={pending}
                error={failure}
                onSubmit={(criterion, points) => handleSubmit(team.id, criterion, points)}
              />
            ))}
          </Stack>
        )}
      </QueryState>
    </Stack>
  );
}
