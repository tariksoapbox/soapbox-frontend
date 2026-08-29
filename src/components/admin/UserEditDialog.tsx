'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { RHFTextField } from '../RHFTextField';
import { PasswordField } from '../PasswordField';
import { FormAlert } from '../FormAlert';
import { admin as copy } from '@/content/admin';
import { common } from '@/content/common';
import type { AdminUser } from '@/schemas/contracts';
import { userEditFormSchema, type UserEditForm } from '@/schemas/forms';
import { useUpdateUser } from '@/lib/queries/admin';
import type { UpdateUserInput } from '@/lib/api/admin';

/**
 * Editing an account.
 *
 * Editing is the safe operation and deleting is the destructive one: scores
 * reference `app_user.id`, which never changes, so a correction keeps every vote
 * that judge has already cast — while deleting them cascades those votes away.
 *
 * Only changed fields are sent, so a save that touches the name cannot quietly
 * re-write the role, and the password is omitted entirely unless one was typed.
 */
export function UserEditDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const update = useUpdateUser();
  const { control, handleSubmit, reset } = useForm<UserEditForm>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: { displayName: '', username: '', password: '' },
  });

  // Refill whenever a different row is opened; the password always starts blank,
  // because blank is what "leave it alone" means. `user` and `reset` are the
  // only dependencies on purpose — the mutation object is a new reference on
  // every render, so depending on it would re-fire this effect forever. Its
  // error is cleared in `close()` instead, which every exit path goes through.
  useEffect(() => {
    if (!user) return;
    reset({
      displayName: user.displayName,
      username: user.username,
      password: '',
    });
  }, [user, reset]);

  function close() {
    update.reset();
    onClose();
  }

  function submit(values: UserEditForm) {
    if (!user) return;
    // Diff against the row, so an unchanged field is never part of the request.
    const patch: UpdateUserInput = {};
    if (values.displayName !== user.displayName) patch.displayName = values.displayName;
    if (values.username !== user.username) patch.username = values.username;
    if (values.password !== '') patch.password = values.password;

    if (Object.keys(patch).length === 0) {
      close();
      return;
    }
    update.mutate({ id: user.id, patch }, { onSuccess: close });
  }

  // `useWatch` rather than `watch()` — the latter is not memoization-safe and
  // the React Compiler lint flags it.
  const passwordTyped = useWatch({ control, name: 'password' }) !== '';

  return (
    <Dialog
      open={user !== null}
      onClose={update.isPending ? undefined : close}
      maxWidth="xs"
      fullWidth
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle>{copy.users.editTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormAlert error={update.error} />
            <RHFTextField
              control={control}
              name="displayName"
              label={copy.users.displayName}
              autoFocus
            />
            <RHFTextField
              control={control}
              name="username"
              label={copy.users.username}
              helperText={copy.users.usernameHelp}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <PasswordField
              control={control}
              name="password"
              label={copy.users.newPassword}
              helperText={copy.users.newPasswordHelp}
              autoComplete="new-password"
            />
            {/* The consequence appears when it becomes one — not on open, where
                it would announce a change that has not happened. */}
            <Collapse in={passwordTyped} unmountOnExit>
              <Alert severity="warning">{copy.users.passwordWillSignOut}</Alert>
            </Collapse>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={close} disabled={update.isPending}>
            {common.cancel}
          </Button>
          <Button type="submit" variant="contained" disabled={update.isPending}>
            {common.save}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
