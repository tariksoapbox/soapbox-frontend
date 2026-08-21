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
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import { QueryState } from '../QueryState';
import { ConfirmDialog } from '../ConfirmDialog';
import { admin as copy } from '@/content/admin';
import { criteria, criteriaShort } from '@/content/common';
import { useClearScore, useScoreMatrix, useTeams } from '@/lib/queries/admin';
import { CRITERIA, type Criterion, type ScoreEntry } from '@/schemas/contracts';

interface PendingClear {
  score: ScoreEntry;
  judgeName: string;
  teamName: string;
}

/**
 * Judge × team, one grid per criterion.
 *
 * This exists to answer one question fast: a column is stuck at 4/5 — who is
 * missing? A blank cell names the judge and the team, and every filled cell can
 * be cleared so a mis-tap can be recast. It is the only place a judge's
 * individual score is ever shown; the public board only carries totals.
 */
export function ScoresTab() {
  const matrix = useScoreMatrix();
  const teams = useTeams();
  const clear = useClearScore();
  const [pending, setPending] = useState<PendingClear | null>(null);

  const judges = matrix.data?.judges.filter((j) => j.isActive) ?? [];
  const byCell = new Map(
    (matrix.data?.scores ?? []).map((s) => [`${s.teamId}:${s.judgeId}:${s.criterion}`, s]),
  );

  return (
    <Stack spacing={3}>
      <Typography sx={{ color: 'text.secondary' }}>{copy.scores.subtitle}</Typography>

      <QueryState
        isPending={matrix.isPending || teams.isPending}
        error={matrix.error ?? teams.error}
        isEmpty={teams.data?.length === 0}
        emptyMessage={copy.scores.empty}
        onRetry={() => void matrix.refetch()}
      >
        {judges.length === 0 ? (
          <Alert severity="warning">{copy.scores.noJudges}</Alert>
        ) : (
          CRITERIA.map((criterion) => (
            <Box key={criterion}>
              <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>
                {criteria[criterion]}
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 160 }}>{criteriaShort[criterion]}</TableCell>
                      {judges.map((judge) => (
                        <TableCell key={judge.id} align="center">
                          {judge.displayName}
                        </TableCell>
                      ))}
                      <TableCell align="right">{copy.scores.title}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teams.data?.map((team) => {
                      const cells = judges.map((judge) => ({
                        judge,
                        score: byCell.get(`${team.id}:${judge.id}:${criterion}`),
                      }));
                      const total = cells.reduce((sum, c) => sum + (c.score?.points ?? 0), 0);
                      return (
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
                          {cells.map(({ judge, score }) => (
                            <TableCell key={judge.id} align="center" sx={{ px: 0.5 }}>
                              {score ? (
                                <ScoreChip
                                  points={score.points}
                                  onClear={() =>
                                    setPending({
                                      score,
                                      judgeName: judge.displayName,
                                      teamName: team.name,
                                    })
                                  }
                                  label={`${copy.scores.clear} — ${judge.displayName}, ${team.name}`}
                                />
                              ) : (
                                <Typography variant="caption" sx={{ color: 'brand.pending' }}>
                                  {copy.scores.pending}
                                </Typography>
                              )}
                            </TableCell>
                          ))}
                          <TableCell align="right">
                            <Typography variant="numeric" sx={{ fontSize: 16 }}>
                              {total}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}
      </QueryState>

      <ConfirmDialog
        open={pending !== null}
        title={copy.scores.confirmClearTitle}
        description={
          pending
            ? copy.scores.confirmClear(pending.judgeName, pending.teamName, pending.score.points)
            : ''
        }
        confirmLabel={copy.scores.clear}
        busy={clear.isPending}
        onClose={() => setPending(null)}
        onConfirm={() =>
          pending && clear.mutate(pending.score.id, { onSettled: () => setPending(null) })
        }
      />
    </Stack>
  );
}

/** A cast score, with the clear action tucked behind a hover/focus reveal. */
function ScoreChip({
  points,
  onClear,
  label,
}: {
  points: number;
  onClear: () => void;
  label: string;
}) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="numeric" sx={{ fontSize: 15 }}>
        {points}
      </Typography>
      <Tooltip title={label}>
        <IconButton
          size="small"
          aria-label={label}
          onClick={onClear}
          sx={{
            color: 'text.secondary',
            opacity: { xs: 1, md: 0 },
            '&:focus-visible, .MuiTableRow-root:hover &': { opacity: 1 },
          }}
        >
          <BackspaceOutlinedIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
