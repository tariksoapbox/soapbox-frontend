import { describe, it, expect } from 'vitest';
import {
  loginFormSchema,
  runTimeFormSchema,
  teamFormSchema,
  userEditFormSchema,
  userFormSchema,
} from './forms';

describe('loginFormSchema', () => {
  it('requires both fields', () => {
    expect(loginFormSchema.safeParse({ username: 'admin', password: 'x' }).success).toBe(true);
    expect(loginFormSchema.safeParse({ username: '  ', password: 'x' }).success).toBe(false);
    expect(loginFormSchema.safeParse({ username: 'admin', password: '' }).success).toBe(false);
  });
});

describe('teamFormSchema', () => {
  it('accepts a name with or without a start number', () => {
    expect(teamFormSchema.safeParse({ name: 'Una Kayak', bibNumber: '' }).success).toBe(true);
    expect(teamFormSchema.safeParse({ name: 'Una Kayak', bibNumber: '7' }).success).toBe(true);
  });

  it('rejects a name that is too short or too long', () => {
    expect(teamFormSchema.safeParse({ name: 'A', bibNumber: '' }).success).toBe(false);
    expect(teamFormSchema.safeParse({ name: 'x'.repeat(81), bibNumber: '' }).success).toBe(false);
  });

  it.each(['0', 'abc', '1000', '-1', '1.5'])('rejects the start number %s', (bibNumber) => {
    expect(teamFormSchema.safeParse({ name: 'Ekipa', bibNumber }).success).toBe(false);
  });
});

describe('userFormSchema', () => {
  const valid = {
    displayName: 'Drugi Admin',
    username: 'Drugi',
    password: 'Tarik123!',
  };

  it('normalises the username to lowercase', () => {
    expect(userFormSchema.parse(valid).username).toBe('drugi');
  });

  it.each([
    ['a short username', { username: 'ab' }],
    ['a username with a space', { username: 'drugi admin' }],
    ['a username with a diacritic', { username: 'drugič' }],
    ['a short password', { password: 'kratka' }],
    ['a short name', { displayName: 'S' }],
  ])('rejects %s', (_label, override) => {
    expect(userFormSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });
});

describe('judgeFormSchema', () => {
  it('is a name and nothing else — judges never sign in', async () => {
    const { judgeFormSchema } = await import('./forms');
    expect(judgeFormSchema.parse({ name: '  Buba Corelli  ', password: 'x' })).toEqual({
      name: 'Buba Corelli',
    });
    expect(judgeFormSchema.safeParse({ name: 'B' }).success).toBe(false);
  });
});

describe('userEditFormSchema', () => {
  const valid = { displayName: 'Drugi Admin', username: 'drugi' };

  it('treats a blank password as "keep the current one"', () => {
    expect(userEditFormSchema.safeParse({ ...valid, password: '' }).success).toBe(true);
  });

  it('still enforces the length rule on a password that was typed', () => {
    expect(userEditFormSchema.safeParse({ ...valid, password: 'NovaLozinka1' }).success).toBe(true);
    expect(userEditFormSchema.safeParse({ ...valid, password: 'kratka' }).success).toBe(false);
  });

  it('applies the creation rules to every other field', () => {
    expect(userEditFormSchema.safeParse({ ...valid, password: '', username: 'ab' }).success).toBe(
      false,
    );
    expect(userEditFormSchema.safeParse({ ...valid, password: '', displayName: 'S' }).success).toBe(
      false,
    );
  });
});

describe('runTimeFormSchema', () => {
  it.each(['1:57', '1:57.42', '1:57,42', '117.42', '117', '01:57.420'])('accepts %s', (runTime) => {
    expect(runTimeFormSchema.safeParse({ runTime }).success).toBe(true);
  });

  it.each(['banana', '', '1:60', '1:2:3', '2;32', '1.2345'])('rejects %s', (runTime) => {
    expect(runTimeFormSchema.safeParse({ runTime }).success).toBe(false);
  });
});
