'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { common } from '@/content/common';

/**
 * The one confirmation surface. Used for every destructive admin action —
 * deleting a team or a judge cascades to their scores, so each one is spelled
 * out in `description` before it happens.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = common.delete,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>{description}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button color="secondary" onClick={onClose} disabled={busy}>
          {common.cancel}
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
