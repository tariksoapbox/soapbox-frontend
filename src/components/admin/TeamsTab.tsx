'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { RHFTextField } from '../RHFTextField';
import { FormAlert } from '../FormAlert';
import { QueryState } from '../QueryState';
import { ConfirmDialog } from '../ConfirmDialog';
import { TeamNameField } from './TeamNameField';
import { RunTimeField } from './RunTimeField';
import { admin as copy } from '@/content/admin';
import { teamFormSchema, type TeamForm } from '@/schemas/forms';
import { useCreateTeam, useDeleteTeam, useTeams } from '@/lib/queries/admin';
import type { Team } from '@/schemas/contracts';

/**
 * Naming the teams and entering their run times — the two things the brief asks
 * an admin to do. Both live on one screen because during an event they happen
 * in the same breath: a team finishes, you find its row, you type the time.
 */
export function TeamsTab() {
  const teams = useTeams();
  const create = useCreateTeam();
  const remove = useDeleteTeam();
  const [pendingDelete, setPendingDelete] = useState<Team | null>(null);

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: { name: '', bibNumber: '' },
  });

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h3" component="h2">
            {copy.teams.add}
          </Typography>
          <Box
            component="form"
            noValidate
            sx={{ mt: 2 }}
            onSubmit={form.handleSubmit((values) =>
              create.mutate(
                {
                  name: values.name,
                  bibNumber: values.bibNumber === '' ? null : Number(values.bibNumber),
                },
                { onSuccess: () => form.reset({ name: '', bibNumber: '' }) },
              ),
            )}
          >
            <Stack spacing={2}>
              <FormAlert error={create.error} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ alignItems: 'flex-start' }}
              >
                <RHFTextField control={form.control} name="name" label={copy.teams.name} />
                <RHFTextField
                  control={form.control}
                  name="bibNumber"
                  label={copy.teams.bibOptional}
                  inputMode="numeric"
                  sx={{ maxWidth: { sm: 200 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={create.isPending}
                  sx={{ flexShrink: 0, height: 56 }}
                >
                  {copy.teams.add}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <QueryState
        isPending={teams.isPending}
        error={teams.error}
        isEmpty={teams.data?.length === 0}
        emptyMessage={copy.teams.empty}
        onRetry={() => void teams.refetch()}
      >
        <Stack spacing={1.5}>
          {teams.data?.map((team) => (
            <Card key={team.id}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { lg: 'flex-start' } }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}
                  >
                    {team.bibNumber !== null && (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'brand.elevated',
                          border: 1,
                          borderColor: 'divider',
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="numeric">{team.bibNumber}</Typography>
                      </Box>
                    )}
                    <TeamNameField team={team} />
                  </Stack>
                  {/* `flex-start`, not `center`: RunTimeField carries helper
                      text under its input, so centring would drop the icon
                      below the input it belongs to. Aligned to the top, the
                      theme's 40px icon box matches the 40px field exactly. */}
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <RunTimeField team={team} />
                    <Tooltip title={copy.teams.confirmDeleteTitle}>
                      <IconButton
                        onClick={() => setPendingDelete(team)}
                        aria-label={`${copy.teams.confirmDeleteTitle} ${team.name}`}
                        sx={{ color: 'brand.redText' }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </QueryState>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.teams.confirmDeleteTitle}
        description={pendingDelete ? copy.teams.confirmDelete(pendingDelete.name) : ''}
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
