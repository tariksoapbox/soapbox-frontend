'use client';

import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { GradeField, gradeText, isValidGrade } from './GradeField';
import { useSaveCriterionScores } from '@/lib/queries/admin';
import { admin as copy } from '@/content/admin';
import { common } from '@/content/common';
import { criteria } from '@/content/common';
import type { Criterion } from '@/schemas/contracts';

/**
 * One judge's mark, edited in place in the grid.
 *
 * Saves on blur (and on Enter, which blurs) rather than on every keystroke:
 * typing `10` would otherwise write a `1` first. Only this judge's entry is
 * sent, and the API replaces just what it is given, so a correction never
 * disturbs the rest of the column.
 *
 * The draft is local and deliberately survives the grid's polling. The parent
 * keys this component on the stored value, so a change made elsewhere — the
 * bulk dialog, another tab — remounts it with fresh text, while typing (which
 * does not change the stored value) leaves it alone.
 */
export function InlineGradeCell({
  teamId,
  teamName,
  criterion,
  judgeId,
  judgeName,
  stored,
}: {
  teamId: string;
  teamName: string;
  criterion: Criterion;
  judgeId: string;
  judgeName: string;
  stored: number | undefined;
}) {
  const save = useSaveCriterionScores();
  const [text, setText] = useState(() => gradeText(stored));

  const invalid = text !== '' && !isValidGrade(text);

  function commit() {
    if (invalid) return;
    const points = text === '' ? null : Number(text);
    if (points === (stored ?? null)) return; // nothing changed — no request
    save.mutate(
      { teamId, criterion, scores: [{ judgeId, points }] },
      // Put the stored value back if the write is refused, so the grid never
      // shows a number the server does not have.
      { onError: () => setText(gradeText(stored)) },
    );
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <GradeField
        label={copy.scores.gradeIn(judgeName, teamName, criteria[criterion])}
        value={text}
        error={invalid || Boolean(save.error)}
        disabled={save.isPending}
        onChange={setText}
        onCommit={commit}
      />
      {save.isPending && (
        <CircularProgress
          size={14}
          aria-label={common.loading}
          sx={{ position: 'absolute', right: -18, top: 9, color: 'text.secondary' }}
        />
      )}
    </Box>
  );
}
