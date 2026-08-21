import { Box, Container, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

/**
 * Header + page title + content, so every screen agrees on its width, padding
 * and heading level. Pages supply only their own content.
 */
export function PageShell({
  title,
  subtitle,
  actions,
  children,
  maxWidth = 'lg',
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container maxWidth={maxWidth} sx={{ py: { xs: 3, sm: 4 }, flex: 1 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h1" component="h1">
              {title}
            </Typography>
            {subtitle && (
              <Typography sx={{ color: 'text.secondary', mt: 0.5, maxWidth: '62ch' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Stack>
        {children}
      </Container>
    </Box>
  );
}
