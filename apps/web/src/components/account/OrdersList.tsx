'use client';

import Link from 'next/link';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';
import type { OrderSummary } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
  PENDING: 'bg-amber-500/10 text-amber-500',
  CONFIRMED: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-indigo-500/10 text-indigo-500',
};

export function OrdersList({ items }: { items: OrderSummary[] }) {
  const { t, locale } = useT();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-32 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl border border-line bg-surface text-faint">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-fg">{t('orders.empty')}</h1>
        </div>
        <Link
          href="/catalog"
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          {t('orders.startShopping')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-fg">{t('orders.title')}</h1>

      <div className="space-y-3">
        {items.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/30 hover:shadow-[0_0_0_1px_var(--color-accent)/20]"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-elevated text-faint group-hover:text-accent transition-colors">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-semibold text-fg">{order.number}</p>
                <p className="text-xs text-muted">
                  {fmtDate(order.createdAt)} ·{' '}
                  {order.items.length} {t('orders.items').replace('{n}', String(order.items.length))}
                  {order.payment ? ' · ' + PAYMENT_PROVIDER_LABELS[order.payment.provider] : ''}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right space-y-1">
              <p className="text-sm font-semibold tabular-nums text-fg">{formatPrice(order.totalUzs)}</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[order.status] ?? 'bg-elevated text-muted'}`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
