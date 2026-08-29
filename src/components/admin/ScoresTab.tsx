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

/**
 * A judge's column. The 52px field plus 14px either side leaves ~28px between
 * adjacent inputs, so a row of marks reads as separate numbers rather than one
 * run-together strip. Wide enough to breathe, narrow enough that a bigger panel
 * still scrolls rather than breaks — the team column is pinned, so growing the
 * panel costs scroll, not legibility.
 *
 * The padding is an explicit measurement, not a spacing step: it is derived
 * from the field width, so it should not move when the spacing scale does.
 */
const judgeColumn = { width: 88, maxWidth: 88, px: '14px' } as const;

/**
 * The header above a judge's column.
 *
 * A judge's name is a **name**, not a column label, so it opts out of the
 * theme's uppercase + `.1em` tracking: "ELVEDINA MUZAFERIJA" set that way is
 * far wider than the column and spills into the neighbouring header, which is
 * how two judges' surnames end up touching. Sentence case at 12px fits, reads
 * better, and wraps onto a second line when it needs to. `overflowWrap` is the
 * backstop for a single name longer than the column can ever hold — it breaks
 * rather than overlapping the judge next to it.
 */
const judgeHeader = {
  ...judgeColumn,
  textTransform: 'none',
  letterSpacing: 0,
  fontSize: 12,
  lineHeight: 1.3,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  verticalAlign: 'bottom',
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
                <TableCell key={judge.id} align="center" sx={judgeHeader}>
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
                    <TableCell key={judge.id} align="center" sx={judgeColumn}>
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
