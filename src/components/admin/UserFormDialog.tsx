'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
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
import { common, roles } from '@/content/common';
import { ROLES } from '@/schemas/contracts';
import { userFormSchema, type UserForm } from '@/schemas/forms';
import { useCreateUser } from '@/lib/queries/admin';

/**
 * Creating an account. This dialog is the *only* way a user comes into
 * existence — there is no registration screen anywhere in the app, and the API
 * has no route for one.
 */
export function UserFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateUser();
  const { control, handleSubmit, reset } = useForm<UserForm>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { displayName: '', username: '', password: '', role: 'referee' },
  });

  function close() {
    reset();
    create.reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={create.isPending ? undefined : close} maxWidth="xs" fullWidth>
      <form
        onSubmit={handleSubmit((values) => create.mutate(values, { onSuccess: close }))}
        noValidate
      >
        <DialogTitle>{copy.users.addTitle}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormAlert error={create.error} />
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
            {/* Masked, with a reveal — the admin reads this out to the judge
                once and it can never be reset, so being able to check it before
                saving is the difference between a working account and a new one. */}
            <PasswordField
              control={control}
              name="password"
              label={copy.users.password}
              helperText={copy.users.passwordHelp}
              autoComplete="new-password"
            />
            <RHFTextField control={control} name="role" label={copy.users.role} select>
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {roles[role]}
                </MenuItem>
              ))}
            </RHFTextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="secondary" onClick={close} disabled={create.isPending}>
            {common.cancel}
          </Button>
          <Button type="submit" variant="contained" disabled={create.isPending}>
            {common.save}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
