'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Stack, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { RHFTextField } from './RHFTextField';
import { PasswordField } from './PasswordField';
import { FormAlert } from './FormAlert';
import { auth } from '@/content/auth';
import { loginFormSchema, type LoginForm as LoginValues } from '@/schemas/forms';
import { useLogin, useSession } from '@/lib/queries/session';
import { homeFor } from '@/lib/routes';

export function LoginForm() {
  const router = useRouter();
  const { data: user } = useSession();
  const login = useLogin();
  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: '', password: '' },
  });

  // Covers both "just signed in" and "came back to /prijava with a live session".
  useEffect(() => {
    if (user) router.replace(homeFor(user.role));
  }, [user, router]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => login.mutate(values))}
      noValidate
      sx={{ mt: 3 }}
    >
      <Stack spacing={2}>
        <FormAlert error={login.error} />
        <RHFTextField
          control={control}
          name="username"
          label={auth.username}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        <PasswordField
          control={control}
          name="password"
          label={auth.password}
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
          {login.isPending ? auth.submitting : auth.submit}
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3, color: 'text.secondary' }}>
        <InfoOutlinedIcon fontSize="small" sx={{ mt: '2px', flexShrink: 0 }} />
        <Box>
          <Typography variant="body2">{auth.sessionNotice}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {auth.noSignUp}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
