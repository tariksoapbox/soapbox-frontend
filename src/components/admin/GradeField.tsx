'use client';

import { TextField } from '@mui/material';

/**
 * One judge's mark, typed.
 *
 * Used in the grid, where a correction has to be a couple of keystrokes and a
 * ten-button picker per cell would not fit across a panel of judges. The
 * dialog uses `ScorePicker` instead — that is where a whole column is set
 * deliberately rather than patched.
 *
 * An empty field means "not written down yet" and is stored as a blank, never
 * as a zero: a missing card must not drag a total down.
 */
export function GradeField({
  label,
  value,
  disabled,
  error,
  onChange,
  onCommit,
}: {
  label: string;
  /** The raw text, so a half-typed value survives a re-render. */
  value: string;
  disabled?: boolean;
  error?: boolean;
  onChange: (text: string) => void;
  onCommit?: () => void;
}) {
  return (
    <TextField
      value={value}
      onChange={(e) => {
        const next = e.target.value.trim();
        // Reject anything that could never become a mark, so the field cannot
        // hold a value that would fail at save.
        if (next !== '' && !/^\d{1,2}$/.test(next)) return;
        if (next !== '' && Number(next) > 10) return;
        onChange(next);
      }}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      disabled={disabled}
      error={error}
      size="small"
      variant="outlined"
      slotProps={{
        htmlInput: {
          // `inputMode` rather than `type="number"`: no spinners, and the
          // scroll wheel cannot silently change a mark being hovered over.
          inputMode: 'numeric',
          maxLength: 2,
          'aria-label': label,
          style: { textAlign: 'center', fontVariantNumeric: 'tabular-nums', padding: '6px 0' },
        },
      }}
      sx={{ width: 52, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
    />
  );
}

/** A whole 1–10, which is the only thing a judge can award. */
export function isValidGrade(text: string): boolean {
  return /^\d{1,2}$/.test(text) && Number(text) >= 1 && Number(text) <= 10;
}

/** What the field should show for a stored mark. */
export function gradeText(points: number | undefined): string {
  return points === undefined ? '' : String(points);
}
