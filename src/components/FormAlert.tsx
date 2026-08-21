'use client';

import { Alert, Collapse } from '@mui/material';
import { ApiError } from '@/lib/api';
import { common } from '@/content/common';

/**
 * Submit-level failures, at the top of the form. API errors already carry
 * Bosnian copy, so the message is shown verbatim; anything else falls back to
 * the generic line rather than leaking a stack or an English runtime message.
 */
export function FormAlert({ error }: { error: unknown }) {
  const message =
    error instanceof ApiError ? error.message : error ? common.genericError : undefined;
  return (
    <Collapse in={Boolean(message)} unmountOnExit>
      <Alert severity="error" sx={{ mb: 0 }}>
        {message}
      </Alert>
    </Collapse>
  );
}
