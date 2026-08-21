import type { Role } from '@/schemas/contracts';

/** Every path in the app, in one place. */
export const routes = {
  login: '/prijava',
  judge: '/sudija',
  admin: '/admin',
  /** Not linked from the UI — the board lives in a tab in each console. */
  standings: '/rang-lista',
} as const;

/**
 * Where a signed-in user belongs. Judges land on their ballot (the only thing
 * they can do); admins land on the console. Anyone signed out goes to the login
 * screen — there is nothing public in this app.
 */
export function homeFor(role: Role | undefined | null): string {
  if (role === 'admin') return routes.admin;
  if (role === 'referee') return routes.judge;
  return routes.login;
}
