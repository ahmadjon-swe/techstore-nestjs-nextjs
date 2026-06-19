'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { href: '/admin/products', label: 'Products', icon: Package, roles: ['OWNER', 'MANAGER', 'STAFF'] },
  { href: '/admin/users', label: 'Team & customers', icon: Users, roles: ['OWNER', 'MANAGER'] },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 p-4">
      {ITEMS.filter((it) => it.roles.includes(role)).map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              active
                ? 'bg-accent/10 text-fg ring-1 ring-accent/20'
                : 'text-muted hover:bg-fg/5 hover:text-fg',
            )}
          >
            <it.icon className={cn('h-4 w-4', active && 'text-accent-ink')} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
