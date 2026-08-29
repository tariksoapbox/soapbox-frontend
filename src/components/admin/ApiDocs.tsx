'use client';

import { Box, Stack, Typography } from '@mui/material';
import { admin as copy } from '@/content/admin';
import { API_BASE_URL } from '@/lib/config';

/**
 * The integration note, next to the keys themselves.
 *
 * Whoever creates a key is usually the person passing it to a developer, so the
 * endpoint and the header belong on this screen rather than in a document that
 * has to be found.
 */
export function ApiDocs() {
  return (
    <Box
      component="section"
      aria-label={copy.apiKeys.docsTitle}
      sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {copy.apiKeys.docsTitle}
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {copy.apiKeys.docsIntro}
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: 'brand.elevated',
            border: 1,
            borderColor: 'divider',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 12.5,
            overflowX: 'auto',
          }}
        >
          {`curl -H "Authorization: Bearer <ključ>" \\\n  ${apiOrigin()}/v1/standings`}
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {copy.apiKeys.docsReturns}
        </Typography>
      </Stack>
    </Box>
  );
}

/**
 * The API's own origin, which is what an external caller must use.
 *
 * The app talks to `/api` on its own host — a proxy that keeps the session
 * cookie first-party — but that path is an implementation detail of this app.
 * Another program has to call the backend directly, so show that address, and
 * fall back to a placeholder rather than printing something that would not work.
 */
export function apiOrigin(): string {
  if (/^https?:\/\//i.test(API_BASE_URL)) return API_BASE_URL.replace(/\/+$/, '');
  return '<adresa API-ja>';
}
