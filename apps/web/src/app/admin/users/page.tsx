import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';

export const metadata: Metadata = { title: 'Users — Admin' };

export default async function AdminUsersPage() {
  const token = await requireAuth();
  const { items } = await adminApi.users(token);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-fg">Users</h1>
        <span className="text-sm text-muted">{items.length} users</span>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-2">
              {['Name', 'Email / Phone', 'Role', 'Joined'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-bg-2/50">
                <td className="px-4 py-3 text-fg">{u.name ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{u.email ?? u.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    u.role === 'OWNER' ? 'bg-accent/10 text-accent' :
                    u.role === 'CUSTOMER' ? 'bg-elevated text-muted' :
                    'bg-new/10 text-new'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
