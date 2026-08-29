'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { QueryState } from '../QueryState';
import { CriterionScoreDialog, type CriterionTarget } from './CriterionScoreDialog';
import { admin as copy } from '@/content/admin';
import { criteria } from '@/content/common';
import { useJudges, useScoreMatrix, useTeams } from '@/lib/queries/admin';
import { CRITERIA, type Criterion, type Team } from '@/schemas/contracts';

/**
 * Where the scores get entered: one row per team, one column per criterion.
 *
 * Each cell is a whole criterion for that team — its running total, how many
 * judges have been entered, and the way in. Opening a cell is opening the stack
 * of paper cards for that run, which is the unit the admin actually works in.
 */
export function ScoresTab() {
  const teams = useTeams();
  const judges = useJudges();
  const matrix = useScoreMatrix();
  const [target, setTarget] = useState<CriterionTarget | null>(null);

  const activeJudges = (judges.data ?? []).filter((j) => j.isActive);

  /** The marks recorded for one team and criterion, keyed by judge. */
  const marksFor = (teamId: string, criterion: Criterion) =>
    new Map(
      (matrix.data?.scores ?? [])
        .filter((s) => s.teamId === teamId && s.criterion === criterion)
        .map((s) => [s.judgeId, s.points]),
    );

  return (
    <Stack spacing={3}>
      <Typography sx={{ color: 'text.secondary', maxWidth: '68ch' }}>
        {copy.scores.subtitle}
      </Typography>

      <QueryState
        isPending={teams.isPending || judges.isPending || matrix.isPending}
        error={teams.error ?? judges.error ?? matrix.error}
        isEmpty={teams.data?.length === 0}
        emptyMessage={copy.scores.empty}
        onRetry={() => void matrix.refetch()}
      >
        {activeJudges.length === 0 ? (
          <Alert severity="warning">{copy.scores.noJudges}</Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 180 }}>{copy.teams.name}</TableCell>
                  {CRITERIA.map((criterion) => (
                    <TableCell key={criterion} align="center" sx={{ minWidth: 200 }}>
                      {criteria[criterion]}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.data?.map((team) => (
                  <TableRow key={team.id} sx={{ '&:hover': { bgcolor: 'brand.rowHover' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {team.bibNumber !== null && (
                        <Box
                          component="span"
                          sx={{
                            color: 'text.secondary',
                            mr: 1,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {team.bibNumber}
                        </Box>
                      )}
                      {team.name}
                    </TableCell>
                    {CRITERIA.map((criterion) => (
                      <TableCell key={criterion} align="center">
                        <CriterionCell
                          marks={marksFor(team.id, criterion)}
                          expected={activeJudges.length}
                          label={`${criteria[criterion]} — ${team.name}`}
                          onOpen={() => setTarget({ team, criterion })}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </QueryState>

      <CriterionScoreDialog
        target={target}
        judges={activeJudges}
        current={target ? marksFor(target.team.id, target.criterion) : new Map()}
        onClose={() => setTarget(null)}
      />
    </Stack>
  );
}

/** One criterion for one team: the total so far, and the way in. */
function CriterionCell({
  marks,
  expected,
  label,
  onOpen,
}: {
  marks: Map<string, number>;
  expected: number;
  label: string;
  onOpen: () => void;
}) {
  const entered = marks.size;
  const total = [...marks.values()].reduce((sum, p) => sum + p, 0);
  const complete = expected > 0 && entered >= expected;

  return (
    <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
      <Button
        onClick={onOpen}
        aria-label={`${entered === 0 ? copy.scores.enter : copy.scores.edit} — ${label}`}
        startIcon={entered > 0 ? <EditOutlinedIcon /> : undefined}
        variant={entered === 0 ? 'outlined' : 'text'}
        color={entered === 0 ? 'primary' : 'secondary'}
        sx={{ minWidth: 132 }}
      >
        {entered === 0 ? (
          copy.scores.enter
        ) : (
          <Typography component="span" variant="numeric" sx={{ fontSize: 18 }}>
            {total}
          </Typography>
        )}
      </Button>
      <Typography
        variant="caption"
        sx={{
          color: complete ? 'success.main' : 'brand.pending',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {copy.scores.of(entered, expected)}
      </Typography>
    </Stack>
  );
}
