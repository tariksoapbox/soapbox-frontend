'use client';

import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { admin as copy } from '@/content/admin';
import { useUpdateTeam } from '@/lib/queries/admin';
import type { Team } from '@/schemas/contracts';

/**
 * Rename a team in place. The Save button only appears once the text actually
 * differs and is long enough — an always-visible button next to every row would
 * be twenty buttons that mostly do nothing.
 */
export function TeamNameField({ team }: { team: Team }) {
  const update = useUpdateTeam();
  const [name, setName] = useState(team.name);
  const trimmed = name.trim();
  const dirty = trimmed !== team.name;
  const valid = trimmed.length >= 2 && trimmed.length <= 80;

  return (
    <Stack direction="row" spacing={1} sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
      <TextField
        label={copy.teams.name}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={dirty && !valid}
        size="small"
      />
      {dirty && (
        <Button
          variant="contained"
          disabled={!valid || update.isPending}
          onClick={() =>
            update.mutate(
              { id: team.id, patch: { name: trimmed } },
              // Put the server's value back if the write is refused, so the
              // field never shows a name that was not saved.
              { onError: () => setName(team.name) },
            )
          }
          sx={{ flexShrink: 0, height: 40 }}
        >
          {copy.teams.saveName}
        </Button>
      )}
    </Stack>
  );
}
