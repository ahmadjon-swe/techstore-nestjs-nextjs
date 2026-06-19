import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';
import { AdminOrderStatusForm } from '@/components/admin/AdminOrderStatusForm';
import { MapPin, Phone, Mail, User, Package, CreditCard, Calendar } from 'lucide-react';

export const metadata: Metadata = { title: 'Order Detail — Admin' };
export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ id: string }> }

const ALL_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  REFUNDED: 'bg-purple-100 text-purple-700',
  PAID: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireAuth();
  const { items: orderList } = await adminApi.orders(token);
  const order = orderList.find((o) => o.id === id);
  if (!order) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">← Orders</Link>
          <h1 className="font-display text-3xl text-fg mt-1">{order.number}</h1>
          <p className="text-muted text-sm flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(order.createdAt).toLocaleString()} · via {order.source}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[order.status] ?? 'bg-elevated text-muted'}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Order info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status update */}
          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="font-medium text-sm uppercase tracking-wide text-muted mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" /> Order status
            </h2>
            <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} statuses={ALL_STATUSES} statusLabels={ORDER_STATUS_LABELS} />
          </div>

          {/* Items */}
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <div className="p-5 border-b border-line">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Items ({order.items.length})</h2>
            </div>
            <div className="divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-fg">{item.titleSnap} <span className="text-muted">× {item.quantity}</span></span>
                  <span className="tabular-nums text-muted">{formatPrice(item.priceUzs)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-5 py-4 border-t border-line font-semibold">
              <span>Total</span>
              <span className="text-accent">{formatPrice(order.totalUzs)}</span>
            </div>
          </div>

          {/* Payment */}
          {order.payment && (
            <div className="bg-surface border border-line rounded-lg p-5">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{PAYMENT_PROVIDER_LABELS[order.payment.provider] ?? order.payment.provider}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  order.payment.status === 'SUCCEEDED' ? 'bg-success/10 text-success' :
                  order.payment.status === 'FAILED' ? 'bg-danger/10 text-danger' :
                  'bg-elevated text-muted'
                }`}>
                  {order.payment.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Customer info */}
        <div className="space-y-5">
          <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted flex items-center gap-2">
                <User className="h-4 w-4" /> Customer
              </h2>
              <Link
                href={`/admin/users/${order.user.id}`}
                className="text-xs text-accent hover:underline"
              >
                View profile →
              </Link>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-fg">{order.user.name ?? 'Unknown'}</p>
              {order.user.email && (
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <a href={`mailto:${order.user.email}`} className="hover:text-fg truncate">{order.user.email}</a>
                </p>
              )}
              {order.user.phone && (
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <a href={`tel:${order.user.phone}`} className="hover:text-fg">{order.user.phone}</a>
                </p>
              )}
            </div>

            <Link
              href={`/admin/users/${order.user.id}`}
              className="block w-full text-center rounded-lg border border-line py-2 text-sm text-muted hover:border-faint hover:text-fg transition-colors"
            >
              All orders by this customer
            </Link>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="bg-surface border border-line rounded-lg p-5 space-y-3">
              <h2 className="font-medium text-sm uppercase tracking-wide text-muted flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Delivery address
              </h2>
              <div className="text-sm space-y-1">
                <p className="text-fg font-medium">{(order.address as any).line1}</p>
                {(order.address as any).line2 && (
                  <p className="text-muted">{(order.address as any).line2}</p>
                )}
                <p className="text-muted">
                  {[(order.address as any).city, (order.address as any).region].filter(Boolean).join(', ')}
                </p>
                {(order.address as any).notes && (
                  <p className="mt-2 text-xs text-faint italic">{(order.address as any).notes}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
