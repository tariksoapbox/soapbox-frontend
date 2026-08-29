'use client';

import { useState, type ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme';
import { ApiError } from '@/lib/api';
import { BackendWakingNotice } from '@/components/BackendWakingNotice';

/**
 * All client-side context, composed once.
 * - AppRouterCacheProvider: Emotion SSR cache for the App Router.
 * - ThemeProvider + CssBaseline: the navy/red theme and baseline styles.
 * - QueryClientProvider: TanStack Query, one client per browser session.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // The live views already poll on their own interval; refetching on
            // every focus would just double the traffic during an event.
            refetchOnWindowFocus: false,
            // A 401 means the session is gone — retrying cannot bring it back,
            // and the route guards need the failure promptly to redirect.
            retry: (failureCount, error) =>
              !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
              failureCount < 2,
          },
        },
      }),
  );

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Global: any call can be the one that wakes a sleeping backend. */}
          <BackendWakingNotice />
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
