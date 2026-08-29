'use client';

import { TextField } from '@mui/material';
import { admin as copy } from '@/content/admin';

/**
 * One judge's mark, typed rather than tapped.
 *
 * The 1–10 picker this replaces was built for a judge scoring on a phone, one
 * team at a time. Nobody does that any more: an admin transcribes a stack of
 * paper cards on a laptop, so typing `8` and tabbing to the next judge is the
 * fast path and ten buttons is the slow one.
 *
 * An empty field means "not written down yet" and is stored as a blank, never
 * as a zero — a missing card must not drag a total down.
 */
export function GradeField({
  judgeName,
  value,
  disabled,
  onChange,
}: {
  judgeName: string;
  value: number | null;
  disabled?: boolean;
  onChange: (points: number | null) => void;
}) {
  // Kept as the raw string so a half-typed value survives a re-render; the
  // parent only ever hears about a valid mark or a blank.
  const text = value === null ? '' : String(value);
  const invalid = text !== '' && !isValidGrade(text);

  return (
    <TextField
      label={copy.scores.grade(judgeName)}
      value={text}
      onChange={(e) => {
        const next = e.target.value.trim();
        if (next === '') return onChange(null);
        if (!/^\d{1,2}$/.test(next)) return; // reject letters and signs outright
        const parsed = Number(next);
        if (parsed >= 1 && parsed <= 10) onChange(parsed);
      }}
      error={invalid}
      helperText={invalid ? copy.scores.invalid : undefined}
      disabled={disabled}
      size="small"
      // `inputMode` rather than `type="number"`: a number input adds spinners
      // and swallows scroll events over the field, both of which get in the way
      // when tabbing down a column of marks.
      slotProps={{
        htmlInput: {
          inputMode: 'numeric',
          maxLength: 2,
          'aria-label': copy.scores.grade(judgeName),
          style: { textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
        },
      }}
      sx={{ width: 92 }}
    />
  );
}

/** A whole 1–10, which is the only thing a judge can award. */
export function isValidGrade(text: string): boolean {
  return /^\d{1,2}$/.test(text) && Number(text) >= 1 && Number(text) <= 10;
}
