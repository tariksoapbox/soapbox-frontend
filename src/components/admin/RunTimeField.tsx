'use client';

import { useState } from 'react';
import { Button, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import { ApiError } from '@/lib/api';
import { admin as copy } from '@/content/admin';
import { runTimeFormSchema } from '@/schemas/forms';
import { useSetRunTime } from '@/lib/queries/admin';
import type { Team } from '@/schemas/contracts';

/**
 * The third criterion, typed in by hand. Saving it republishes the time
 * leaderboard and therefore the combined one, which is why the field validates
 * the shape locally before sending: an admin should learn about `2;32` while
 * their eyes are still on the field, not after a round-trip.
 */
export function RunTimeField({ team }: { team: Team }) {
  const save = useSetRunTime();
  const [value, setValue] = useState(team.runTime ?? '');
  const [touched, setTouched] = useState(false);

  const trimmed = value.trim();
  const localError =
    touched && trimmed !== '' && !runTimeFormSchema.safeParse({ runTime: trimmed }).success;
  const serverError = save.error instanceof ApiError ? save.error.message : null;
  const dirty = trimmed !== (team.runTime ?? '');

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
      <TextField
        label={copy.teams.runTime}
        placeholder={copy.teams.runTimePlaceholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setTouched(true);
        }}
        error={localError || Boolean(serverError)}
        helperText={
          localError
            ? runTimeFormSchema.safeParse({ runTime: trimmed }).success
              ? undefined
              : copy.teams.runTimeHelp
            : (serverError ?? copy.teams.runTimeHelp)
        }
        size="small"
        inputMode="decimal"
        sx={{ width: { xs: '100%', md: 220 }, flexShrink: 0 }}
        slotProps={{ htmlInput: { 'aria-label': `${copy.teams.runTime} — ${team.name}` } }}
      />
      {dirty && (
        <Button
          variant="contained"
          disabled={trimmed === '' || localError || save.isPending}
          onClick={() => save.mutate({ id: team.id, runTime: trimmed })}
          sx={{ flexShrink: 0, height: 40 }}
        >
          {copy.teams.saveTime}
        </Button>
      )}
      {team.runTime !== null && !dirty && (
        <Tooltip title={copy.teams.clearTime}>
          <IconButton
            aria-label={`${copy.teams.clearTime} — ${team.name}`}
            disabled={save.isPending}
            onClick={() =>
              save.mutate({ id: team.id, runTime: null }, { onSuccess: () => setValue('') })
            }
            sx={{ color: 'text.secondary' }}
          >
            <BackspaceOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
