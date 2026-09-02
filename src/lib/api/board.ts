import { apiFetch } from '../api';
import type { PublicStandings } from '@/schemas/contracts';

/**
 * The scoreboard feed. Unauthenticated on purpose — the page it drives is
 * public, so a key here would only be a key published in the browser.
 */
export const getPublicStandings = () => apiFetch<PublicStandings>('/public/standings');
