'use client';

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api';
import { common } from '@/content/common';

/**
 * The three states every list view has: loading, failed, and empty. Having one
 * component own them keeps a spinner from being a `<div>Loading</div>` on one
 * screen and a skeleton on the next.
 */
export function QueryState({
  isPending,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  children,
}: {
  isPending: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (isPending) {
    return (
      <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }} role="status" aria-live="polite">
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>{common.loading}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              {common.retry}
            </Button>
          )
        }
      >
        {error instanceof ApiError ? error.message : common.genericError}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <Box
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography sx={{ color: 'text.secondary' }}>{emptyMessage}</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
