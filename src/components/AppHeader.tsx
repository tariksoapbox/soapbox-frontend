'use client';

import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Brand } from './Brand';
import { common, roles } from '@/content/common';
import { useLogout, useSession } from '@/lib/queries/session';

/**
 * The app chrome: wordmark, who you are, and the way out. Deliberately no
 * navigation — each role's screens are tabs inside its own page, which keeps
 * the switch next to the content it switches and the header quiet.
 */
export function AppHeader() {
  const { data: user } = useSession();
  const logout = useLogout();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: 2, px: { xs: 2, sm: 3 }, minHeight: { xs: 64, sm: 72 } }}>
          <Brand />
          <Box sx={{ flex: 1 }} />
          {user && (
            <>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {user.displayName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {roles[user.role]}
                </Typography>
              </Box>
              <Button
                color="secondary"
                variant="outlined"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                sx={{ flexShrink: 0, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {common.signOut}
                </Box>
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
