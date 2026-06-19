import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { users as usersApi } from '@/lib/api';
import { adminApi } from '@/lib/admin-api';
import { UserRoleSelect } from '@/components/admin/UserRoleSelect';

export const metadata: Metadata = { title: 'Team & customers — Admin' };
export const dynamic = 'force-dynamic';

const ROLE_LEGEND: { role: string; can: string }[] = [
  { role: 'OWNER', can: 'Full control — manages the team & roles, deletes products, everything below.' },
  { role: 'MANAGER', can: 'Catalog (add/edit/publish products & stock), orders, refunds, views customers.' },
  { role: 'STAFF', can: 'Fulfils orders & updates status (no refunds). Views products read-only.' },
  { role: 'CUSTOMER', can: 'Shops, places & tracks orders, leaves reviews.' },
];

export default async function AdminUsersPage() {
  const token = await requireAuth();
  const [me, { items }] = await Promise.all([
    usersApi.profile(token),
    adminApi.users(token),
  ]);
  const isOwner = me.role === 'OWNER';
  const isManager = me.role === 'MANAGER';
  // Managers may only flip the Staff ↔ Customer pair.
  const canEditRow = (targetRole: string, targetId: string) => {
    if (targetId === me.id) return false;
    if (isOwner) return true;
    if (isManager) return targetRole === 'STAFF' || targetRole === 'CUSTOMER';
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-fg">Team &amp; customers</h1>
        <span className="text-sm text-muted">{items.length} users</span>
      </div>

      {/* Responsibility legend */}
      <div className="grid gap-2 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
        {ROLE_LEGEND.map((r) => (
          <div key={r.role} className="flex gap-3 text-sm">
            <span className="mt-0.5 h-fit shrink-0 rounded bg-elevated px-2 py-0.5 text-xs font-medium text-fg">
              {r.role}
            </span>
            <span className="text-muted">{r.can}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-2">
              {['Name', 'Email / Phone', 'Role', 'Joined', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-bg-2/50">
                <td className="px-4 py-3 text-fg">
                  {u.name ?? '—'}
                  {u.id === me.id && <span className="ml-2 text-xs text-faint">(you)</span>}
                </td>
                <td className="px-4 py-3 text-muted">{u.email ?? u.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <UserRoleSelect
                    userId={u.id}
                    role={u.role}
                    actorRole={me.role}
                    editable={canEditRow(u.role, u.id)}
                  />
                </td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-xs text-accent hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isManager && (
        <p className="text-xs text-faint">As a manager you can grant or revoke the Staff role. Only the owner manages owners &amp; managers.</p>
      )}
      {!isOwner && !isManager && (
        <p className="text-xs text-faint">Only owners and managers can change roles.</p>
      )}
    </div>
  );
}
