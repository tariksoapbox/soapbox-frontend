import { apiFetch } from '../api';
import type { Standings } from '@/schemas/contracts';

export const getStandings = () => apiFetch<Standings>('/standings');
