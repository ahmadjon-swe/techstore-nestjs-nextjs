import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, Wallet, Clock, PackageX, ArrowUpRight } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';
import { RevenueChart } from '@/components/admin/RevenueChart';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default async function AdminDashboardPage() {
  const token = await requireAuth();
  const [stats, lowStock, orders] = await Promise.all([
    adminApi.dashboard(token),
    adminApi.lowStock(token),
    adminApi.orders(token).catch(() => ({ items: [], total: 0 })),
  ]);

  const cards = [
    { label: "Today's orders", value: String(stats.todayOrders), href: '/admin/orders', icon: ShoppingCart },
    { label: 'Total revenue', value: formatPrice(stats.totalRevenueUzs), href: '/admin/orders', icon: Wallet },
    { label: 'Pending orders', value: String(stats.pendingOrders), href: '/admin/orders', icon: Clock },
    { label: 'Low stock', value: String(stats.lowStockVariants), href: '/admin/products', icon: PackageX },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-accent-2">Overview</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="border-glow group rounded-2xl border border-line bg-surface/60 p-5 transition-transform hover:-translate-y-0.5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent-ink">
                <card.icon className="h-4 w-4" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-faint transition-colors group-hover:text-fg" />
            </div>
            <p className="text-xs uppercase tracking-wide text-faint">{card.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">{card.value}</p>
          </Link>
        ))}
      </div>

      <RevenueChart orders={orders.items} />

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-medium text-danger">
            <PackageX className="h-4 w-4" /> Low stock
          </h2>
          <div className="space-y-2">
            {lowStock.slice(0, 10).map((v) => (
              <div key={v.id} className="flex justify-between text-sm">
                <span className="text-fg">
                  {v.product.titleEn} <span className="font-mono text-faint">· {v.sku}</span>
                </span>
                <span className="font-mono font-medium text-danger">{v.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
