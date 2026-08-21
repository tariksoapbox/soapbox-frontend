'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { PageShell } from '@/components/PageShell';
import { StandingsBoard } from '@/components/standings/StandingsBoard';
import { standings } from '@/content/standings';

/**
 * The board on its own page — the projector view. Judges and admins each reach
 * the same board from a tab inside their own console; this route exists so it
 * can be opened bare on a second screen.
 */
export default function StandingsPage() {
  return (
    <AuthGuard>
      <PageShell title={standings.title} subtitle={standings.subtitle}>
        <StandingsBoard />
      </PageShell>
    </AuthGuard>
  );
}
