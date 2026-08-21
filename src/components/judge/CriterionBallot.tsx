'use client';

import { useId, useState } from 'react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ScorePicker } from './ScorePicker';
import { judge as copy } from '@/content/judge';
import { formatClock } from '@/lib/format';
import { ApiError } from '@/lib/api';
import type { BallotCell, Criterion } from '@/schemas/contracts';

/**
 * One criterion for one team: pick a score, then send it.
 *
 * Two steps on purpose. The API refuses a second submission for the same cell,
 * so a stray tap would otherwise burn a judge's only vote — separating "choose"
 * from "send" makes the irreversible action deliberate without putting a dialog
 * in front of every one of the twenty-odd votes a judge casts.
 */
export function CriterionBallot({
  criterion,
  label,
  cell,
  onSubmit,
  isSubmitting,
  error,
}: {
  criterion: Criterion;
  label: string;
  cell: BallotCell;
  onSubmit: (points: number) => void;
  isSubmitting: boolean;
  error: unknown;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const labelId = useId();

  if (cell.points !== null) {
    return (
      <Box>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 1, alignItems: 'center' }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={cell.points}
            sx={{
              bgcolor: 'brand.elevated',
              color: 'success.main',
              fontSize: 18,
              fontWeight: 700,
              height: 40,
              px: 1,
              '& .MuiChip-icon': { color: 'success.main' },
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              {copy.submitted}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {copy.submittedAt(formatClock(cell.submittedAt))}
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Typography id={labelId} variant="h6" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <ScorePicker
          value={selected}
          onChange={setSelected}
          disabled={isSubmitting}
          labelledBy={labelId}
        />
      </Box>
      {Boolean(error) && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {error instanceof ApiError ? error.message : copy.submitDisabled}
        </Alert>
      )}
      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 1.5 }}
        disabled={selected === null || isSubmitting}
        onClick={() => selected !== null && onSubmit(selected)}
        data-criterion={criterion}
      >
        {isSubmitting
          ? copy.submitting
          : selected === null
            ? copy.submitDisabled
            : copy.submit(selected)}
      </Button>
    </Box>
  );
}
