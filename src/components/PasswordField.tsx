'use client';

import { useState } from 'react';
import { IconButton, InputAdornment, Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import type { TextFieldProps } from '@mui/material';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { RHFTextField } from './RHFTextField';
import { common } from '@/content/common';

/**
 * A password input with a reveal toggle.
 *
 * Masked by default, because these are typed on a phone in public. The toggle
 * matters more here than in most apps: a judge's password is read out to them
 * once by an admin and can never be reset — so being able to check what was
 * actually typed, on both sides, is the difference between signing in and
 * re-creating the account.
 */
export function PasswordField<T extends FieldValues>({
  control,
  name,
  ...props
}: { control: Control<T>; name: Path<T> } & Omit<TextFieldProps, 'name' | 'error' | 'type'>) {
  const [visible, setVisible] = useState(false);
  const label = visible ? common.hidePassword : common.showPassword;

  return (
    <RHFTextField
      control={control}
      name={name}
      {...props}
      type={visible ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={label}>
                <IconButton
                  aria-label={label}
                  onClick={() => setVisible((v) => !v)}
                  // Toggling visibility is not a form action — without this a
                  // press inside a form would submit it.
                  type="button"
                  edge="end"
                  sx={{ color: 'text.secondary' }}
                >
                  {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
