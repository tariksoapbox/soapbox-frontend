'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { PageShell } from '@/components/PageShell';
import { JudgeConsole } from '@/components/judge/JudgeConsole';
import { judge } from '@/content/judge';

export default function JudgePage() {
  return (
    <AuthGuard role="referee">
      <PageShell title={judge.title} subtitle={judge.subtitle} maxWidth="md">
        <JudgeConsole />
      </PageShell>
    </AuthGuard>
  );
}
