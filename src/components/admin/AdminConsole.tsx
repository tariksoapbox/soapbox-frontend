'use client';

import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { StandingsBoard } from '../standings/StandingsBoard';
import { TeamsTab } from './TeamsTab';
import { ScoresTab } from './ScoresTab';
import { JudgesTab } from './JudgesTab';
import { ApiKeysTab } from './ApiKeysTab';
import { UsersTab } from './UsersTab';
import { admin as copy } from '@/content/admin';

const TABS = ['standings', 'teams', 'scores', 'judges', 'users', 'apiKeys'] as const;
type TabKey = (typeof TABS)[number];

/**
 * The admin's whole workspace. Tab state is local, not routed: the console is
 * one workspace an admin moves around inside during an event, and a per-tab URL
 * would only invite a reload back to a cold cache.
 */
export function AdminConsole() {
  const [tab, setTab] = useState<TabKey>('standings');

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_e, next: TabKey) => setTab(next)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        {TABS.map((key) => (
          <Tab key={key} value={key} label={copy.tabs[key]} />
        ))}
      </Tabs>

      {/* Only the visible tab mounts, so background tabs do not poll the API. */}
      {tab === 'standings' && <StandingsBoard />}
      {tab === 'teams' && <TeamsTab />}
      {tab === 'scores' && <ScoresTab />}
      {tab === 'judges' && <JudgesTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'apiKeys' && <ApiKeysTab />}
    </Box>
  );
}
