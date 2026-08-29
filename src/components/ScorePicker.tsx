'use client';

import { Box, Button } from '@mui/material';

/**
 * The 1–10 scale as ten targets, used inside the bulk-entry dialog.
 *
 * The dialog is where a whole column gets set deliberately — one team, one
 * criterion, every judge — so seeing the range laid out and picking from it
 * beats typing. (Inline edits in the grid use a typed field instead: that is
 * the fast correction path, and ten buttons per cell would not fit.)
 *
 * Selecting is reported immediately; the dialog's own Save is what writes.
 */
export function ScorePicker({
  value,
  onChange,
  disabled,
  labelledBy,
}: {
  value: number | null;
  onChange: (points: number | null) => void;
  disabled?: boolean;
  labelledBy: string;
}) {
  return (
    <Box
      role="radiogroup"
      aria-labelledby={labelledBy}
      sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 0.75 }}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((points) => {
        const selected = value === points;
        return (
          <Button
            key={points}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            // Tapping the selected mark again clears it — that is how a mark
            // goes back to blank without a separate button per judge.
            onClick={() => onChange(selected ? null : points)}
            variant={selected ? 'contained' : 'outlined'}
            color={selected ? 'primary' : 'secondary'}
            sx={{
              minWidth: 0,
              px: 0,
              minHeight: 44,
              borderRadius: 1.5,
              fontSize: 15,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              ...(selected
                ? {}
                : {
                    borderColor: 'brand.fieldBorder',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'brand.rowHover', borderColor: 'brand.fieldBorder' },
                  }),
            }}
          >
            {points}
          </Button>
        );
      })}
    </Box>
  );
}
