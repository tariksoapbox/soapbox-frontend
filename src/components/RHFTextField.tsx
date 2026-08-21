'use client';

import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

/**
 * A react-hook-form-bound `TextField`. Every form uses this, so validation copy
 * always lands in `helperText` under the field it belongs to, and the input is
 * always labelled.
 */
export function RHFTextField<T extends FieldValues>({
  control,
  name,
  helperText,
  ...props
}: { control: Control<T>; name: Path<T> } & Omit<TextFieldProps, 'name' | 'error'>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          {...props}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}
