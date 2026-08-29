'use client';

import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Snackbar } from '@mui/material';
import { onBackendWaking } from '@/lib/api';
import { common } from '@/content/common';

/**
 * Explains the wait while a sleeping backend comes back.
 *
 * On Render's free tier the API spins down after about 15 minutes and takes
 * 20–50 seconds to wake. `apiFetch` absorbs that by retrying, but a judge
 * tapping "Prijavi se" would otherwise watch a disabled button for half a
 * minute with no idea whether anything was happening.
 */
export function BackendWakingNotice() {
  const [waking, setWaking] = useState(false);

  useEffect(() => onBackendWaking(setWaking), []);

  return (
    <Snackbar
      open={waking}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      // Stays until the request resolves — it is a status, not a notification.
      sx={{ maxWidth: 520 }}
    >
      <Alert
        severity="info"
        variant="filled"
        icon={<CircularProgress size={18} sx={{ color: 'inherit' }} />}
        sx={{ width: '100%' }}
      >
        {common.waking}
      </Alert>
    </Snackbar>
  );
}
