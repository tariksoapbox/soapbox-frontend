'use client';

import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { JudgeBallot } from './JudgeBallot';
import { StandingsBoard } from '../standings/StandingsBoard';
import { judge } from '@/content/judge';
import { standings } from '@/content/standings';

const TABS = [
  { key: 'ballot', label: judge.title },
  { key: 'standings', label: standings.title },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/**
 * A judge's two screens, switched next to the content rather than from the
 * header — the same shape as the admin console, so the app has one navigation
 * idea instead of two.
 */
export function JudgeConsole() {
  const [tab, setTab] = useState<TabKey>('ballot');

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_e, next: TabKey) => setTab(next)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {TABS.map(({ key, label }) => (
          <Tab key={key} value={key} label={label} />
        ))}
      </Tabs>

      {/* Only the visible tab mounts, so the hidden one does not poll the API. */}
      {tab === 'ballot' && <JudgeBallot />}
      {tab === 'standings' && <StandingsBoard />}
    </Box>
  );
}
