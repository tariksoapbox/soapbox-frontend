import { z } from 'zod';

/**
 * Form schemas, mirroring the backend's request schemas so a mistake is caught
 * in the field the user is standing in rather than as a round-trip error.
 * The backend re-validates everything regardless — this is a courtesy layer.
 */
export const loginFormSchema = z.object({
  username: z.string().trim().min(1, 'Unesite korisničko ime.'),
  password: z.string().min(1, 'Unesite lozinku.'),
});
export type LoginForm = z.infer<typeof loginFormSchema>;

export const teamFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Naziv ekipe mora imati najmanje 2 znaka.')
    .max(80, 'Naziv ekipe smije imati najviše 80 znakova.'),
  // A cleared field arrives as '' and must mean "no number", not "invalid".
  bibNumber: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{1,3}$/.test(v), 'Startni broj mora biti broj od 1 do 999.')
    .refine((v) => v === '' || Number(v) >= 1, 'Startni broj mora biti najmanje 1.'),
});
export type TeamForm = z.infer<typeof teamFormSchema>;

export const userFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Ime mora imati najmanje 2 znaka.')
    .max(80, 'Ime smije imati najviše 80 znakova.'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Korisničko ime mora imati najmanje 3 znaka.')
    .max(32, 'Korisničko ime smije imati najviše 32 znaka.')
    .regex(/^[a-z0-9._-]+$/, 'Dozvoljena su samo mala slova, brojevi te znakovi . _ -'),
  password: z
    .string()
    .min(8, 'Lozinka mora imati najmanje 8 znakova.')
    .max(128, 'Lozinka smije imati najviše 128 znakova.'),
});
export type UserForm = z.infer<typeof userFormSchema>;

/**
 * Editing an account. Same rules as creation, except the password is optional:
 * an empty field means "keep the current one", which is why it cannot simply
 * reuse `userFormSchema`.
 */
export const userEditFormSchema = userFormSchema.extend({
  password: z.union([z.literal(''), userFormSchema.shape.password]),
});
export type UserEditForm = z.infer<typeof userEditFormSchema>;

/** A judge is a name, so this is the whole form. */
export const judgeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ime sudije mora imati najmanje 2 znaka.')
    .max(80, 'Ime sudije smije imati najviše 80 znakova.'),
});
export type JudgeForm = z.infer<typeof judgeFormSchema>;

export const runTimeFormSchema = z.object({
  // The parser lives on the backend (`lib/runTime.ts`); this only checks the
  // shape, so the two can never disagree about what a valid time IS.
  runTime: z
    .string()
    .trim()
    .refine(
      (v) => /^\d{1,2}:[0-5]\d([.,]\d{1,3})?$/.test(v) || /^\d{1,4}([.,]\d{1,3})?$/.test(v),
      'Unesite vrijeme u obliku m:ss.SS (npr. 1:57.42) ili u sekundama (npr. 117.42).',
    ),
});
export type RunTimeForm = z.infer<typeof runTimeFormSchema>;
