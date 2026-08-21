import { Box, Typography } from '@mui/material';
import { common } from '@/content/common';

/**
 * The wordmark. Deliberately typographic — no Red Bull logo or bull mark
 * anywhere in this app; the brand read comes from the navy/red palette alone.
 */
export function Brand({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const large = size === 'lg';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: large ? 1.25 : 1 }}>
      <Box
        aria-hidden
        sx={{
          width: large ? 8 : 6,
          height: large ? 34 : 24,
          borderRadius: 999,
          bgcolor: 'primary.main',
          flexShrink: 0,
        }}
      />
      <Box sx={{ lineHeight: 1.1 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontSize: large ? 26 : 19,
            fontWeight: 700,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
          }}
        >
          {common.appName}
        </Typography>
        <Typography
          component="span"
          variant="overline"
          sx={{ display: 'block', color: 'text.secondary', fontSize: large ? 11 : 9.5 }}
        >
          {common.appTagline}
        </Typography>
      </Box>
    </Box>
  );
}
