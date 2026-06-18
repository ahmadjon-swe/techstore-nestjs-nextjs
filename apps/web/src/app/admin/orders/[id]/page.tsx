import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';
import { AdminOrderStatusForm } from '@/components/admin/AdminOrderStatusForm';

export const metadata: Metadata = { title: 'Order Detail — Admin' };

interface PageProps { params: Promise<{ id: string }> }

const ALL_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireAuth();
  const { items: orderList } = await adminApi.orders(token);
  const order = orderList.find((o) => o.id === id);
  if (!order) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-sm text-accent">← Orders</Link>
          <h1 className="font-display text-3xl text-fg mt-1">{order.number}</h1>
          <p className="text-muted text-sm">{new Date(order.createdAt).toLocaleString()} · via {order.source}</p>
        </div>
      </div>

      {/* Status update */}
      <div className="bg-surface border border-line rounded-lg p-5">
        <h2 className="font-medium text-sm uppercase tracking-wide text-muted mb-4">Status</h2>
        <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} statuses={ALL_STATUSES} statusLabels={ORDER_STATUS_LABELS} />
      </div>

      {/* Customer */}
      <div className="bg-surface border border-line rounded-lg p-5 space-y-2">
        <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Customer</h2>
        <p className="text-sm text-fg">{order.user.name ?? '—'}</p>
        <p className="text-xs text-muted">{order.user.email ?? order.user.phone ?? ''}</p>
      </div>

      {/* Items */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <div className="p-5 border-b border-line">
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Items</h2>
        </div>
        <div className="divide-y divide-line">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between px-5 py-3 text-sm">
              <span>{item.titleSnap} × {item.quantity}</span>
              <span className="tabular-nums text-muted">{formatPrice(item.priceUzs)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-5 py-4 border-t border-line font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.totalUzs)}</span>
        </div>
      </div>

      {/* Payment */}
      {order.payment && (
        <div className="bg-surface border border-line rounded-lg p-5 space-y-1">
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Payment</h2>
          <p className="text-sm">{PAYMENT_PROVIDER_LABELS[order.payment.provider]} · {order.payment.status}</p>
        </div>
      )}
    </div>
  );
}
