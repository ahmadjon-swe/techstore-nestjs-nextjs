import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { orders } from '@/lib/api';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';

export const metadata: Metadata = { title: 'My Orders' };

export default async function OrdersPage() {
  const token = await requireAuth();
  const data = await orders.list(token).catch(() => ({ items: [], total: 0 }));

  if (data.items.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <h1 className="font-display text-3xl text-fg">No orders yet</h1>
        <Link href="/catalog" className="inline-block bg-elevated text-fg px-6 py-3 rounded hover:bg-elevated transition-colors">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-fg">My Orders</h1>
      <div className="space-y-3">
        {data.items.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="flex items-center justify-between bg-surface border border-line rounded-lg p-5 hover:border-faint transition-colors"
          >
            <div className="space-y-1">
              <p className="font-medium text-fg text-sm">{order.number}</p>
              <p className="text-xs text-muted">
                {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                {order.payment ? PAYMENT_PROVIDER_LABELS[order.payment.provider] : ''}
              </p>
            </div>
            <div className="text-right shrink-0 ml-4 space-y-1">
              <p className="font-semibold text-fg text-sm">{formatPrice(order.totalUzs)}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-sm font-medium ${
                order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                order.status === 'CANCELLED' ? 'bg-danger/10 text-danger' :
                'bg-elevated text-muted'
              }`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
