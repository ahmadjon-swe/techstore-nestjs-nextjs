import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';

export const metadata: Metadata = { title: 'Orders — Admin' };

export default async function AdminOrdersPage() {
  const token = await requireAuth();
  const { items: orderList } = await adminApi.orders(token);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-fg">Orders</h1>
        <span className="text-sm text-muted">{orderList.length} orders</span>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-2">
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orderList.map((order) => (
              <tr key={order.id} className="hover:bg-bg-2/50 transition-colors">
                <td className="px-4 py-3 font-medium text-fg">{order.number}</td>
                <td className="px-4 py-3 text-muted">{order.user.name ?? order.user.email ?? '—'}</td>
                <td className="px-4 py-3 text-muted">{order.items.length}</td>
                <td className="px-4 py-3 tabular-nums">{formatPrice(order.totalUzs)}</td>
                <td className="px-4 py-3 text-muted">
                  {order.payment ? PAYMENT_PROVIDER_LABELS[order.payment.provider] : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                    order.status === 'CANCELLED' ? 'bg-danger/10 text-danger' :
                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-elevated text-muted'
                  }`}>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-accent text-xs hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orderList.length === 0 && (
          <p className="text-center text-muted py-12">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
