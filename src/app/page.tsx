'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useSession } from '@/lib/queries/session';
import { routes } from '@/lib/routes';

/**
 * The root is a switchboard, not a page: nothing here is public, and everyone
 * who can sign in is an administrator — so there is exactly one destination.
 */
export default function RootPage() {
  const router = useRouter();
  const { data: user, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    router.replace(user ? routes.admin : routes.login);
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
