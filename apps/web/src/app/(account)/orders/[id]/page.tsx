import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { orders } from '@/lib/api';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';

export const metadata: Metadata = { title: 'Order Details' };

interface PageProps { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireAuth();
  let order;
  try {
    order = await orders.get(token, id);
  } catch {
    notFound();
  }

  const steps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];
  const stepIdx = steps.indexOf(order.status);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/orders" className="text-sm text-accent hover:text-accent-ink">← All orders</Link>
          <h1 className="font-display text-3xl text-fg mt-1">{order.number}</h1>
          <p className="text-muted text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded font-medium ${
          order.status === 'COMPLETED' ? 'bg-success/10 text-success' :
          order.status === 'CANCELLED' ? 'bg-danger/10 text-danger' :
          'bg-elevated text-muted'
        }`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Progress bar */}
      {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-3 h-3 rounded-full shrink-0 ${i <= stepIdx ? 'bg-[var(--color-accent)] shadow-[0_0_8px] shadow-accent/50' : 'bg-elevated'}`} />
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < stepIdx ? 'bg-[var(--color-accent)]' : 'bg-elevated'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <div className="p-5 border-b border-line">
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Items</h2>
        </div>
        <div className="divide-y divide-line">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between px-5 py-4 text-sm">
              <span className="text-fg">{item.titleSnap} × {item.quantity}</span>
              <span className="text-muted tabular-nums">{formatPrice(item.priceUzs)}</span>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-line flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.totalUzs)}</span>
        </div>
      </div>

      {/* Payment + Address */}
      <div className="grid sm:grid-cols-2 gap-4">
        {order.payment && (
          <div className="bg-surface border border-line rounded-lg p-5 space-y-2">
            <h3 className="text-xs uppercase tracking-wide text-muted font-medium">Payment</h3>
            <p className="text-sm text-fg">{PAYMENT_PROVIDER_LABELS[order.payment.provider] ?? order.payment.provider}</p>
            <p className="text-xs text-muted">{order.payment.status}</p>
          </div>
        )}
        {order.address && (
          <div className="bg-surface border border-line rounded-lg p-5 space-y-2">
            <h3 className="text-xs uppercase tracking-wide text-muted font-medium">Delivery address</h3>
            <p className="text-sm text-fg">{order.address.line1}</p>
            <p className="text-sm text-muted">{[order.address.city, order.address.region].filter(Boolean).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
