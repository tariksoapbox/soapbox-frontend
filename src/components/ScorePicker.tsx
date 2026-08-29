'use client';

import { Box, Button } from '@mui/material';

/**
 * The 1–10 scale, as ten targets.
 *
 * A judge uses this on a phone, outdoors, standing up — so it is buttons rather
 * than a select or a slider: every value is one tap away and nothing can be
 * dragged past by accident. Selecting does not submit; the card's own button
 * does, because a submitted score is final.
 */
export function ScorePicker({
  value,
  onChange,
  disabled,
  labelledBy,
}: {
  value: number | null;
  onChange: (points: number) => void;
  disabled?: boolean;
  labelledBy: string;
}) {
  return (
    <Box
      role="radiogroup"
      aria-labelledby={labelledBy}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(5, 1fr)', sm: 'repeat(10, 1fr)' },
        gap: 1,
      }}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((points) => {
        const selected = value === points;
        return (
          <Button
            key={points}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(points)}
            variant={selected ? 'contained' : 'outlined'}
            color={selected ? 'primary' : 'secondary'}
            sx={{
              minWidth: 0,
              px: 0,
              // Comfortably above the 44px touch-target minimum.
              minHeight: 52,
              borderRadius: 2,
              fontSize: 18,
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
