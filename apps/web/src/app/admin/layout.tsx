import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAccessToken } from '@/lib/auth';
import { users } from '@/lib/api';
import { AdminNav } from '@/components/admin/AdminNav';

const ADMIN_ROLES = ['OWNER', 'MANAGER', 'STAFF'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = await getAccessToken();
  if (!token) redirect('/auth/login');

  const profile = await users.profile(token).catch(() => null);
  if (!profile || !ADMIN_ROLES.includes(profile.role)) redirect('/');

  return (
    <div className="flex min-h-screen">
      <aside className="glass sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line md:flex">
        <div className="border-b border-line p-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white">
              T
            </span>
            <span className="font-display font-semibold">TechStore</span>
          </Link>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-faint">
            Admin · {profile.role}
          </p>
        </div>
        <AdminNav />
        <div className="border-t border-line p-4">
          <p className="truncate text-xs text-faint">{profile.email ?? profile.name}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
