'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { admin as copy } from '@/content/admin';

/**
 * The one and only sighting of a new key.
 *
 * The server keeps a hash, not the key, so this dialog is the last place it
 * exists — which is why it cannot be dismissed by clicking away or pressing
 * Escape. Closing is a deliberate "I have saved it", because the alternative is
 * an admin losing a credential to a stray click and having to issue another.
 */
export function ApiKeySecretDialog({
  secret,
  onClose,
}: {
  secret: string | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(secret ?? '');
      setCopied(true);
    } catch {
      // Clipboard access can be refused (insecure context, permissions). The
      // key is on screen and selectable, so this is a convenience, not the
      // only way out.
      setCopied(false);
    }
  }

  return (
    <Dialog open={secret !== null} maxWidth="sm" fullWidth>
      <DialogTitle>{copy.apiKeys.secretTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Alert severity="warning">{copy.apiKeys.secretWarning}</Alert>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Box
              component="code"
              sx={{
                flex: 1,
                minWidth: 0,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'brand.elevated',
                border: 1,
                borderColor: 'divider',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 13,
                // A key has no spaces to break on, so it must be told to wrap.
                overflowWrap: 'anywhere',
                userSelect: 'all',
              }}
            >
              {secret}
            </Box>
            <Tooltip title={copied ? copy.apiKeys.copied : copy.apiKeys.copy}>
              <IconButton
                aria-label={copy.apiKeys.copy}
                onClick={() => void copyToClipboard()}
                sx={{ color: copied ? 'success.main' : 'text.secondary' }}
              >
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="contained" onClick={onClose}>
          {copy.apiKeys.done}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
