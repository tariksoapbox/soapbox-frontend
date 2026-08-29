'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { RHFTextField } from '../RHFTextField';
import { FormAlert } from '../FormAlert';
import { QueryState } from '../QueryState';
import { ConfirmDialog } from '../ConfirmDialog';
import { ApiKeySecretDialog } from './ApiKeySecretDialog';
import { ApiDocs } from './ApiDocs';
import { admin as copy } from '@/content/admin';
import { formatClock } from '@/lib/format';
import { apiKeyFormSchema, type ApiKeyForm } from '@/schemas/forms';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '@/lib/queries/admin';
import type { ApiKey } from '@/schemas/contracts';

/**
 * Keys another app uses to read the board.
 *
 * A key is shown exactly once, when it is created — the server keeps only a
 * hash — so the create flow hands straight to a dialog the admin has to
 * acknowledge. Revoking is one click and takes effect immediately; the row
 * stays, greyed, with the last time the key was seen, which is how you work out
 * which integration just went quiet.
 */
export function ApiKeysTab() {
  const keys = useApiKeys();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();
  const [secret, setSecret] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null);

  const form = useForm<ApiKeyForm>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: { name: '' },
  });

  return (
    <Stack spacing={3}>
      <Typography sx={{ color: 'text.secondary', maxWidth: '72ch' }}>
        {copy.apiKeys.subtitle}
      </Typography>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            component="form"
            noValidate
            onSubmit={form.handleSubmit((values) =>
              create.mutate(values.name, {
                onSuccess: (result) => {
                  // Straight to the dialog: this response is the only place the
                  // key will ever exist.
                  setSecret(result.secret);
                  form.reset({ name: '' });
                },
              }),
            )}
          >
            <Stack spacing={2}>
              <FormAlert error={create.error} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: 'flex-start' }}
              >
                <RHFTextField
                  control={form.control}
                  name="name"
                  label={copy.apiKeys.name}
                  helperText={copy.apiKeys.nameHelp}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<VpnKeyOutlinedIcon />}
                  disabled={create.isPending}
                  sx={{ flexShrink: 0, height: 56 }}
                >
                  {copy.apiKeys.add}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <ApiDocs />

      <QueryState
        isPending={keys.isPending}
        error={keys.error}
        isEmpty={keys.data?.length === 0}
        emptyMessage={copy.apiKeys.empty}
        onRetry={() => void keys.refetch()}
      >
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{copy.apiKeys.name}</TableCell>
                <TableCell>{copy.apiKeys.title}</TableCell>
                <TableCell>{copy.apiKeys.created}</TableCell>
                <TableCell>{copy.apiKeys.lastUsed}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {keys.data?.map((key) => {
                const revoked = key.revokedAt !== null;
                return (
                  <TableRow
                    key={key.id}
                    sx={{ opacity: revoked ? 0.6 : 1, '&:hover': { bgcolor: 'brand.rowHover' } }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {key.name}
                      <Chip
                        label={revoked ? copy.apiKeys.revoked : copy.apiKeys.active}
                        size="small"
                        sx={{
                          ml: 1,
                          bgcolor: 'brand.elevated',
                          color: revoked ? 'brand.pending' : 'success.main',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: 'text.secondary',
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontSize: 12.5,
                      }}
                    >
                      {key.prefix}…
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {formatClock(key.createdAt)}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {key.lastUsedAt ? formatClock(key.lastUsedAt) : copy.apiKeys.neverUsed}
                    </TableCell>
                    <TableCell align="right">
                      {!revoked && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => setPendingRevoke(key)}
                          disabled={revoke.isPending}
                        >
                          {copy.apiKeys.revoke}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </QueryState>

      <ApiKeySecretDialog secret={secret} onClose={() => setSecret(null)} />
      <ConfirmDialog
        open={pendingRevoke !== null}
        title={copy.apiKeys.revokeTitle}
        description={pendingRevoke ? copy.apiKeys.revokeBody(pendingRevoke.name) : ''}
        confirmLabel={copy.apiKeys.revoke}
        busy={revoke.isPending}
        onClose={() => setPendingRevoke(null)}
        onConfirm={() =>
          pendingRevoke &&
          revoke.mutate(pendingRevoke.id, { onSettled: () => setPendingRevoke(null) })
        }
      />
    </Stack>
  );
}
