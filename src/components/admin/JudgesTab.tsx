'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { RHFTextField } from '../RHFTextField';
import { FormAlert } from '../FormAlert';
import { QueryState } from '../QueryState';
import { ConfirmDialog } from '../ConfirmDialog';
import { admin as copy } from '@/content/admin';
import { judgeFormSchema, type JudgeForm } from '@/schemas/forms';
import { useCreateJudge, useDeleteJudge, useJudges, useUpdateJudge } from '@/lib/queries/admin';
import type { Judge } from '@/schemas/contracts';

/**
 * The panel.
 *
 * A judge has a name and nothing else — they never sign in, so there is no
 * username, no password and no account to manage. Removing one from the panel
 * is the ordinary action; deleting them takes their marks with them.
 */
export function JudgesTab() {
  const judges = useJudges();
  const create = useCreateJudge();
  const remove = useDeleteJudge();
  const [pendingDelete, setPendingDelete] = useState<Judge | null>(null);

  const form = useForm<JudgeForm>({
    resolver: zodResolver(judgeFormSchema),
    defaultValues: { name: '' },
  });

  return (
    <Stack spacing={3}>
      <Typography sx={{ color: 'text.secondary', maxWidth: '68ch' }}>
        {copy.judges.subtitle}
      </Typography>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            component="form"
            noValidate
            onSubmit={form.handleSubmit((values) =>
              create.mutate(values.name, { onSuccess: () => form.reset({ name: '' }) }),
            )}
          >
            <Stack spacing={2}>
              <FormAlert error={create.error} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: 'flex-start' }}
              >
                <RHFTextField control={form.control} name="name" label={copy.judges.name} />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAddAltIcon />}
                  disabled={create.isPending}
                  sx={{ flexShrink: 0, height: 56 }}
                >
                  {copy.judges.add}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {judges.data && (
        <Stack spacing={1.5}>
          <Alert severity="info">{copy.judges.countNotice}</Alert>
          <Alert severity="info">{copy.judges.editSafeNotice}</Alert>
        </Stack>
      )}

      <QueryState
        isPending={judges.isPending}
        error={judges.error}
        isEmpty={judges.data?.length === 0}
        emptyMessage={copy.judges.empty}
        onRetry={() => void judges.refetch()}
      >
        <Stack spacing={1.5}>
          {judges.data?.map((judge) => (
            <JudgeRow key={judge.id} judge={judge} onDelete={() => setPendingDelete(judge)} />
          ))}
        </Stack>
      </QueryState>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.judges.confirmDeleteTitle}
        description={pendingDelete ? copy.judges.confirmDelete(pendingDelete.name) : ''}
        busy={remove.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() =>
          pendingDelete &&
          remove.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) })
        }
      />
    </Stack>
  );
}

/** One judge: rename in place, take off the panel, or remove entirely. */
function JudgeRow({ judge, onDelete }: { judge: Judge; onDelete: () => void }) {
  const update = useUpdateJudge();
  const [name, setName] = useState(judge.name);
  const trimmed = name.trim();
  const dirty = trimmed !== judge.name;
  const valid = trimmed.length >= 2 && trimmed.length <= 80;

  return (
    <Card sx={{ opacity: judge.isActive ? 1 : 0.65 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <TextField
            label={copy.judges.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={dirty && !valid}
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            {dirty ? (
              <Button
                variant="contained"
                disabled={!valid || update.isPending}
                onClick={() =>
                  update.mutate(
                    { id: judge.id, patch: { name: trimmed } },
                    // Put the saved name back if the write is refused, so the
                    // field never shows something that was not stored.
                    { onError: () => setName(judge.name) },
                  )
                }
              >
                {copy.teams.saveName}
              </Button>
            ) : (
              <Chip
                label={judge.isActive ? copy.judges.active : copy.judges.inactive}
                size="small"
                sx={{
                  bgcolor: 'brand.elevated',
                  color: judge.isActive ? 'success.main' : 'brand.pending',
                }}
              />
            )}
            <Button
              size="small"
              color="secondary"
              disabled={update.isPending}
              onClick={() => update.mutate({ id: judge.id, patch: { isActive: !judge.isActive } })}
            >
              {judge.isActive ? copy.judges.deactivate : copy.judges.activate}
            </Button>
            <Tooltip title={copy.judges.confirmDeleteTitle}>
              <IconButton
                size="small"
                aria-label={`${copy.judges.confirmDeleteTitle} ${judge.name}`}
                onClick={onDelete}
                sx={{ color: 'brand.redText' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
