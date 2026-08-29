'use client';

import { useId, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { GradeField } from './GradeField';
import { FormAlert } from '../FormAlert';
import { admin as copy } from '@/content/admin';
import { common, criteria } from '@/content/common';
import { useSaveCriterionScores } from '@/lib/queries/admin';
import type { Criterion, Judge, Team } from '@/schemas/contracts';

export interface CriterionTarget {
  team: Team;
  criterion: Criterion;
}

/**
 * One criterion for one team, every judge at once.
 *
 * This is the shape the scores actually arrive in: a stack of paper cards for a
 * single run, one card per judge, all for the same criterion. Entering them
 * together means the admin types a column and saves once, and the totals move
 * in one step rather than flickering upward five times.
 *
 * Marks are never final here — re-opening and saving again is how a
 * transcription error gets fixed, and clearing one returns it to blank rather
 * than to a zero that would quietly drag the total down.
 */
export function CriterionScoreDialog({
  target,
  judges,
  current,
  onClose,
}: {
  target: CriterionTarget | null;
  judges: Judge[];
  /** The marks already recorded, keyed by judge id. */
  current: Map<string, number>;
  onClose: () => void;
}) {
  return (
    <Dialog open={target !== null} onClose={onClose} maxWidth="sm" fullWidth>
      {target && (
        // Keyed by the cell, so opening a different one builds a fresh draft
        // from that cell's marks. This is what an effect would otherwise have
        // to do by hand — and it also means a poll landing mid-edit cannot
        // overwrite what is being typed, because `current` is read once, at
        // mount, rather than tracked.
        <CriterionScoreForm
          key={`${target.team.id}:${target.criterion}`}
          target={target}
          judges={judges}
          current={current}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

function CriterionScoreForm({
  target,
  judges,
  current,
  onClose,
}: {
  target: CriterionTarget;
  judges: Judge[];
  current: Map<string, number>;
  onClose: () => void;
}) {
  const save = useSaveCriterionScores();
  const headingId = useId();
  const [draft, setDraft] = useState<Map<string, number | null>>(
    () => new Map(judges.map((j) => [j.id, current.get(j.id) ?? null])),
  );

  const total = [...draft.values()].reduce<number>((sum, p) => sum + (p ?? 0), 0);
  const entered = [...draft.values()].filter((p) => p !== null).length;

  function submit() {
    save.mutate(
      {
        teamId: target.team.id,
        criterion: target.criterion,
        scores: [...draft].map(([judgeId, points]) => ({ judgeId, points })),
      },
      { onSuccess: onClose },
    );
  }

  return (
    <>
      <DialogTitle id={headingId}>
        {copy.scores.dialogTitle(criteria[target.criterion], target.team.name)}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <FormAlert error={save.error} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {copy.scores.dialogHelp}
          </Typography>

          {judges.length === 0 ? (
            <Alert severity="warning">{copy.scores.noJudges}</Alert>
          ) : (
            <Stack divider={<Divider flexItem />}>
              {judges.map((judge) => (
                <Stack
                  key={judge.id}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', py: 1.25 }}
                >
                  <Typography variant="h6" sx={{ minWidth: 0 }}>
                    {judge.name}
                  </Typography>
                  <GradeField
                    judgeName={judge.name}
                    value={draft.get(judge.id) ?? null}
                    disabled={save.isPending}
                    onChange={(points) => setDraft((prev) => new Map(prev).set(judge.id, points))}
                  />
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {copy.scores.total}
          </Typography>
          <Typography variant="numeric" sx={{ fontSize: 20 }}>
            {total}
          </Typography>
          <Chip
            label={copy.scores.of(entered, judges.length)}
            size="small"
            sx={{ bgcolor: 'brand.elevated', color: 'text.secondary' }}
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button color="secondary" onClick={onClose} disabled={save.isPending}>
            {common.cancel}
          </Button>
          <Button variant="contained" onClick={submit} disabled={save.isPending}>
            {common.save}
          </Button>
        </Stack>
      </DialogActions>
    </>
  );
}
