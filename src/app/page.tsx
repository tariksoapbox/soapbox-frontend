'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useSession } from '@/lib/queries/session';
import { homeFor, routes } from '@/lib/routes';

/**
 * The root is a switchboard, not a page: nothing in this app is public, so it
 * asks who you are and sends you to the one screen your role can use.
 */
export default function RootPage() {
  const router = useRouter();
  const { data: user, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    router.replace(user ? homeFor(user.role) : routes.login);
  }, [isPending, user, router]);

  return (
    <Box
      sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress color="primary" />
    </Box>
  );
}
