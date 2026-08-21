'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useSession } from '@/lib/queries/session';
import { homeFor, routes } from '@/lib/routes';
import type { Role } from '@/schemas/contracts';

/**
 * Client-side route guard.
 *
 * The real enforcement is the API's — every route it serves checks the session
 * and the role, so this only decides what to *render*. Its job is to avoid
 * flashing a console at someone who is about to be redirected, and to send a
 * judge who lands on `/admin` somewhere they can actually work.
 *
 * Omit `role` for a screen any signed-in user may read (the board).
 */
export function AuthGuard({ role, children }: { role?: Role; children: ReactNode }) {
  const router = useRouter();
  const { data: user, isPending } = useSession();
  const allowed = Boolean(user) && (role === undefined || user?.role === role);

  useEffect(() => {
    if (isPending || allowed) return;
    // Signed in but on the wrong screen → their own home. Signed out → login.
    router.replace(user ? homeFor(user.role) : routes.login);
  }, [isPending, allowed, user, router]);

  if (isPending || !allowed) {
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
