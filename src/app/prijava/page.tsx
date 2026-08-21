'use client';

import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import { Brand } from '@/components/Brand';
import { LoginForm } from '@/components/LoginForm';
import { auth } from '@/content/auth';

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        // A single red wash off the top-left corner: the brand read, with no logo.
        background: (t) =>
          `radial-gradient(120% 90% at 10% -10%, ${t.palette.primary.dark}55 0%, transparent 55%)`,
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Brand size="lg" />
        </Box>
        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h1" component="h1">
              {auth.title}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mt: 1 }}>{auth.intro}</Typography>
            <LoginForm />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
