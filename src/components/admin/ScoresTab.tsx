'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { QueryState } from '../QueryState';
import { CriterionScoreDialog, type CriterionTarget } from './CriterionScoreDialog';
import { InlineGradeCell } from './InlineGradeCell';
import { admin as copy } from '@/content/admin';
import { criteria } from '@/content/common';
import { useJudges, useScoreMatrix, useTeams } from '@/lib/queries/admin';
import { CRITERIA, type Criterion, type Judge, type Team } from '@/schemas/contracts';

/**
 * Every mark, in the open and editable: one table per criterion, a column per
 * judge, a field in every cell.
 *
 * Two ways in, because there are two jobs. Typing straight into a cell is the
 * correction path — a judge's card was misread, fix that one number. The row
 * button opens the whole criterion in a dialog, which is how a fresh column
 * gets entered.
 *
 * The layout has to survive a panel growing past five: the team column is
 * pinned, so the judges scroll horizontally underneath it without the row
 * losing its label.
 */
export function ScoresTab() {
  const teams = useTeams();
  const judges = useJudges();
  const matrix = useScoreMatrix();
  const [target, setTarget] = useState<CriterionTarget | null>(null);

  const activeJudges = (judges.data ?? []).filter((j) => j.isActive);
  const scores = matrix.data?.scores ?? [];

  const marksFor = (teamId: string, criterion: Criterion) =>
    new Map(
      scores
        .filter((s) => s.teamId === teamId && s.criterion === criterion)
        .map((s) => [s.judgeId, s.points]),
    );

  return (
    <Stack spacing={3}>
      <Typography sx={{ color: 'text.secondary', maxWidth: '72ch' }}>
        {copy.scores.inlineHelp}
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

/**
 * The pinned first column. Both the header and the body cell need the same
 * offset and an opaque background, or the judge columns show through as they
 * scroll underneath.
 */
const stickyTeamColumn = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  minWidth: 150,
  maxWidth: 220,
} as const;

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
        <Table size="small" sx={{ '& td, & th': { px: 1, py: 0.75 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...stickyTeamColumn, bgcolor: 'brand.elevated' }}>
                {copy.scores.team}
              </TableCell>
              {judges.map((judge) => (
                <TableCell
                  key={judge.id}
                  align="center"
                  // Narrow and wrapping, so a long name costs height rather
                  // than pushing every other judge off the screen.
                  sx={{ width: 68, maxWidth: 68, whiteSpace: 'normal', lineHeight: 1.25 }}
                >
                  {judge.name}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ width: 78 }}>
                {copy.scores.total}
              </TableCell>
              <TableCell align="right" sx={{ width: 44 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => {
              const marks = marksFor(team.id, criterion);
              const total = [...marks.values()].reduce((sum, p) => sum + p, 0);
              const complete = marks.size >= judges.length;
              return (
                <TableRow key={team.id} sx={{ '&:hover td': { bgcolor: 'brand.rowHover' } }}>
                  <TableCell
                    sx={{ ...stickyTeamColumn, bgcolor: 'background.paper', fontWeight: 600 }}
                  >
                    {team.bibNumber !== null && (
                      <Box
                        component="span"
                        sx={{
                          color: 'text.secondary',
                          mr: 0.75,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {team.bibNumber}
                      </Box>
                    )}
                    {team.name}
                  </TableCell>
                  {judges.map((judge) => (
                    <TableCell key={judge.id} align="center">
                      <InlineGradeCell
                        // Remount when the STORED value changes — a bulk save
                        // or another tab — but not while typing, which does
                        // not change it.
                        key={`${judge.id}:${marks.get(judge.id) ?? ''}`}
                        teamId={team.id}
                        teamName={team.name}
                        criterion={criterion}
                        judgeId={judge.id}
                        judgeName={judge.name}
                        stored={marks.get(judge.id)}
                      />
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Stack spacing={0.25} sx={{ alignItems: 'flex-end' }}>
                      <Typography variant="numeric" sx={{ fontSize: 16 }}>
                        {total}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: complete ? 'success.main' : 'brand.pending',
                          fontVariantNumeric: 'tabular-nums',
                          lineHeight: 1.2,
                        }}
                      >
                        {marks.size}/{judges.length}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={copy.scores.edit}>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(team)}
                        aria-label={`${copy.scores.edit} — ${criteria[criterion]} — ${team.name}`}
                        sx={{ color: 'text.secondary' }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
