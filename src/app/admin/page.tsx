'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { PageShell } from '@/components/PageShell';
import { AdminConsole } from '@/components/admin/AdminConsole';
import { admin } from '@/content/admin';

export default function AdminPage() {
  return (
    <AuthGuard role="admin">
      <PageShell title={admin.title}>
        <AdminConsole />
      </PageShell>
    </AuthGuard>
  );
}
