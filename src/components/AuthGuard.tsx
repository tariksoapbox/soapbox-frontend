'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useSession } from '@/lib/queries/session';
import { routes } from '@/lib/routes';

/**
 * Client-side route guard.
 *
 * The real enforcement is the API's — every route it serves checks the session.
 * This only decides what to *render*, so a console never flashes at someone who
 * is about to be redirected. There is no role to check: everyone who can sign
 * in is an administrator.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending } = useSession();

  useEffect(() => {
    if (isPending || user) return;
    router.replace(routes.login);
  }, [isPending, user, router]);

  if (isPending || !user) {
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
  return <>{children}</>;
}
