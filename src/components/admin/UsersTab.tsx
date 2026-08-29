'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { QueryState } from '../QueryState';
import { ConfirmDialog } from '../ConfirmDialog';
import { FormAlert } from '../FormAlert';
import { UserFormDialog } from './UserFormDialog';
import { UserEditDialog } from './UserEditDialog';
import { admin as copy } from '@/content/admin';
import { useDeleteUser, useSetUserActive, useUsers } from '@/lib/queries/admin';
import { useSession } from '@/lib/queries/session';
import type { AdminUser } from '@/schemas/contracts';

/**
 * Account management: create judges and other admins, deactivate them, reset a
 * password, remove them. Judges cannot reach any of this, and cannot sign up —
 * every account on this list was created here.
 */
export function UsersTab() {
  const users = useUsers();
  const setActive = useSetUserActive();
  const remove = useDeleteUser();
  const { data: me } = useSession();

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography sx={{ color: 'text.secondary', maxWidth: '62ch' }}>
          {copy.users.subtitle}
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddAltIcon />}
          onClick={() => setAdding(true)}
          sx={{ flexShrink: 0, alignSelf: 'flex-start' }}
        >
          {copy.users.add}
        </Button>
      </Stack>

      {/* Context for the list — held back until there is a list, so it never
          sits above a load error. */}
      {users.data && (
        <Stack spacing={1.5}>
          <Alert severity="info">{copy.users.lastAdminNotice}</Alert>
          <Alert severity="info">{copy.users.editSafeNotice}</Alert>
        </Stack>
      )}
      <FormAlert error={setActive.error ?? remove.error} />

      <QueryState
        isPending={users.isPending}
        error={users.error}
        onRetry={() => void users.refetch()}
      >
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{copy.users.displayName}</TableCell>
                <TableCell>{copy.users.username}</TableCell>
                <TableCell>{copy.users.active}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {users.data?.map((user) => {
                const isMe = user.id === me?.id;
                return (
                  <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'brand.rowHover' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {user.displayName}
                      {isMe && (
                        <Chip
                          label={copy.users.you}
                          size="small"
                          sx={{ ml: 1, bgcolor: 'brand.elevated', color: 'text.secondary' }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{user.username}</TableCell>
                    <TableCell>
                      {/* Colour is paired with a word, so the state is never carried by hue alone. */}
                      <Chip
                        label={user.isActive ? copy.users.active : copy.users.inactive}
                        size="small"
                        sx={{
                          bgcolor: 'brand.elevated',
                          color: user.isActive ? 'success.main' : 'brand.pending',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {/* Every control here is single-line, so centre them:
                          without this the Stack stretches and the button and
                          the two icons sit on three different baselines. */}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <Button
                          size="small"
                          color="secondary"
                          disabled={isMe || setActive.isPending}
                          onClick={() =>
                            setActive.mutate({ id: user.id, isActive: !user.isActive })
                          }
                        >
                          {user.isActive ? copy.users.deactivate : copy.users.activate}
                        </Button>
                        <Tooltip title={copy.users.edit}>
                          <IconButton
                            size="small"
                            aria-label={`${copy.users.edit} — ${user.displayName}`}
                            onClick={() => setEditing(user)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={copy.users.confirmDeleteTitle}>
                          <Box component="span">
                            <IconButton
                              size="small"
                              disabled={isMe}
                              aria-label={`${copy.users.confirmDeleteTitle} ${user.displayName}`}
                              onClick={() => setPendingDelete(user)}
                              sx={{ color: 'brand.redText' }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </QueryState>

      <UserFormDialog open={adding} onClose={() => setAdding(false)} />
      <UserEditDialog user={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={pendingDelete !== null}
        title={copy.users.confirmDeleteTitle}
        description={pendingDelete ? copy.users.confirmDelete(pendingDelete.displayName) : ''}
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
