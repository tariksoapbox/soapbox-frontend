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
import { CRITERIA, type Criterion, type Judge, type Team } from '@/schemas/contracts';

/**
 * Every mark, in the open: one table per criterion, a column per judge.
 *
 * The whole point is to be able to read the panel at a glance — who has been
 * entered, who is still blank, and what each of them gave — because that is the
 * question an admin actually has mid-event. The row's button opens the same
 * criterion in a dialog, where the column gets typed in one pass.
 */
export function ScoresTab() {
  const teams = useTeams();
  const judges = useJudges();
  const matrix = useScoreMatrix();
  const [target, setTarget] = useState<CriterionTarget | null>(null);

  const activeJudges = (judges.data ?? []).filter((j) => j.isActive);
  const scores = matrix.data?.scores ?? [];

  /** The marks recorded for one team and criterion, keyed by judge. */
  const marksFor = (teamId: string, criterion: Criterion) =>
    new Map(
      scores
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
          <Stack spacing={4}>
            {CRITERIA.map((criterion) => (
              <CriterionTable
                key={criterion}
                criterion={criterion}
                teams={teams.data ?? []}
                judges={activeJudges}
                marksFor={marksFor}
                onEdit={(team) => setTarget({ team, criterion })}
              />
            ))}
          </Stack>
        )}
      </QueryState>

      <CriterionScoreDialog
        target={target}
        judges={activeJudges}
        current={target ? marksFor(target.team.id, target.criterion) : new Map<string, number>()}
        onClose={() => setTarget(null)}
      />
    </Stack>
  );
}

/** One criterion: teams down the side, judges across the top. */
function CriterionTable({
  criterion,
  teams,
  judges,
  marksFor,
  onEdit,
}: {
  criterion: Criterion;
  teams: Team[];
  judges: Judge[];
  marksFor: (teamId: string, criterion: Criterion) => Map<string, number>;
  onEdit: (team: Team) => void;
}) {
  return (
    <Box>
      <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>
        {criteria[criterion]}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 170 }}>{copy.scores.team}</TableCell>
              {judges.map((judge) => (
                <TableCell key={judge.id} align="center">
                  {judge.name}
                </TableCell>
              ))}
              <TableCell align="right">{copy.scores.total}</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => {
              const marks = marksFor(team.id, criterion);
              const total = [...marks.values()].reduce((sum, p) => sum + p, 0);
              const complete = marks.size >= judges.length;
              return (
                <TableRow key={team.id} sx={{ '&:hover': { bgcolor: 'brand.rowHover' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {team.bibNumber !== null && (
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary', mr: 1, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {team.bibNumber}
                      </Box>
                    )}
                    {team.name}
                  </TableCell>
                  {judges.map((judge) => {
                    const mark = marks.get(judge.id);
                    return (
                      <TableCell key={judge.id} align="center">
                        {mark === undefined ? (
                          <Typography variant="caption" sx={{ color: 'brand.pending' }}>
                            {copy.scores.pending}
                          </Typography>
                        ) : (
                          <Typography variant="numeric" sx={{ fontSize: 15 }}>
                            {mark}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="right">
                    <Stack spacing={0.25} sx={{ alignItems: 'flex-end' }}>
                      <Typography variant="numeric" sx={{ fontSize: 17 }}>
                        {total}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: complete ? 'success.main' : 'brand.pending',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {copy.scores.of(marks.size, judges.length)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="secondary"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => onEdit(team)}
                      aria-label={`${copy.scores.edit} — ${criteria[criterion]} — ${team.name}`}
                    >
                      {marks.size === 0 ? copy.scores.enter : copy.scores.edit}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
