import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { formatPrice, ORDER_STATUS_LABELS } from '@/lib/utils';
import { Mail, Phone, MapPin, Globe, ShieldCheck, Calendar, Package } from 'lucide-react';

export const metadata: Metadata = { title: 'Customer — Admin' };
export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ id: string }> }

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-accent/10 text-accent-ink',
  MANAGER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  STAFF: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  CUSTOMER: 'bg-elevated text-muted',
};

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireAuth();

  let user;
  let ordersData;
  try {
    [user, ordersData] = await Promise.all([
      adminApi.getUser(token, id),
      adminApi.getUserOrders(token, id),
    ]);
  } catch {
    notFound();
  }

  const orders = ordersData.items;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/admin/users" className="text-sm text-accent hover:underline">← Team & customers</Link>
        <h1 className="font-display text-3xl text-fg mt-1">{user.name ?? 'Unknown user'}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role] ?? 'bg-elevated text-muted'}`}>
            {user.role}
          </span>
          <span className="text-sm text-muted flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: contact + addresses */}
        <div className="space-y-5">
          {/* Contact info */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Contact</h2>
            <div className="space-y-2.5">
              {user.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-faint" />
                  <a href={`mailto:${user.email}`} className="text-fg hover:text-accent truncate">{user.email}</a>
                </div>
              )}
              {user.phone ? (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-faint" />
                  <a href={`tel:${user.phone}`} className="text-fg hover:text-accent">{user.phone}</a>
                </div>
              ) : (
                <p className="text-xs text-faint italic">No phone number</p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 shrink-0 text-faint" />
                <span className="text-muted uppercase">{user.locale ?? 'uz'}</span>
              </div>
              {user.isGoogleLinked && (
                <div className="flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted">Google linked</span>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-surface border border-line rounded-lg p-5 space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Saved addresses ({user.addresses.length})
            </h2>
            {user.addresses.length === 0 ? (
              <p className="text-xs text-faint italic">No saved addresses.</p>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div key={addr.id} className={`rounded-lg border p-3 text-sm space-y-0.5 ${addr.isDefault ? 'border-accent/40 bg-accent/5' : 'border-line'}`}>
                    {addr.label && <p className="text-xs font-medium uppercase text-faint">{addr.label}{addr.isDefault ? ' · Default' : ''}</p>}
                    <p className="text-fg">{addr.line1}</p>
                    {addr.line2 && <p className="text-muted">{addr.line2}</p>}
                    <p className="text-muted">{[addr.city, addr.region].filter(Boolean).join(', ')}</p>
                    {addr.notes && <p className="text-xs text-faint italic mt-1">{addr.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: orders */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <div className="p-5 border-b border-line flex items-center justify-between">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted flex items-center gap-2">
                <Package className="h-4 w-4" /> Orders ({ordersData.total})
              </h2>
            </div>
            {orders.length === 0 ? (
              <p className="text-center text-muted py-12 text-sm">No orders yet.</p>
            ) : (
              <div className="divide-y divide-line">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-bg-2/50 transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-fg group-hover:text-accent transition-colors">{order.number}</p>
                      <p className="text-xs text-muted">
                        {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4 space-y-1">
                      <p className="text-sm font-semibold tabular-nums">{formatPrice(order.totalUzs)}</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                        order.status === 'CANCELLED' ? 'bg-danger/10 text-danger' :
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-elevated text-muted'
                      }`}>
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
