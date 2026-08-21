/**
 * The one place an env var is read on the client.
 *
 * The default `/api` is same-origin and goes through the rewrite in
 * `next.config.ts`, which is what keeps the session cookie first-party. Only
 * override `NEXT_PUBLIC_API_URL` to call a backend directly — see `.env.example`.
 */
export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL ?? '/api';
