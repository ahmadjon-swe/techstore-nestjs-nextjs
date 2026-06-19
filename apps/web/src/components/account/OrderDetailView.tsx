'use client';

import Link from 'next/link';
import { Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { formatPrice, ORDER_STATUS_LABELS, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';
import { CancelOrderButton } from './CancelOrderButton';

const STEPS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'];

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
  PENDING: 'bg-amber-500/10 text-amber-500',
  CONFIRMED: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-indigo-500/10 text-indigo-500',
};

export function OrderDetailView({ order }: { order: any }) {
  const { t, locale } = useT();
  const stepIdx = STEPS.indexOf(order.status);
  const cancelled = ['CANCELLED', 'REFUNDED'].includes(order.status);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/orders" className="mb-3 flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="h-3.5 w-3.5" /> {t('order.back')}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-fg">{order.number}</h1>
            <p className="mt-1 text-sm text-muted">{t('order.placed')} {fmtDate(order.createdAt)}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-elevated text-muted'}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {!cancelled && (
        <div className="relative flex items-center">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center">
              <div className={`relative z-10 grid h-3 w-3 shrink-0 place-items-center rounded-full transition-all ${i <= stepIdx ? 'bg-accent shadow-[0_0_10px_-1px_var(--color-accent)]' : 'bg-elevated'}`}>
                {i === stepIdx && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${i < stepIdx ? 'bg-accent' : 'bg-elevated'}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Package className="h-4 w-4 text-faint" />
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">{t('order.items')}</h2>
        </div>
        <div className="divide-y divide-line">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 text-sm">
              <span className="text-fg">{item.titleSnap} <span className="text-faint">×{item.quantity}</span></span>
              <span className="tabular-nums text-muted">{formatPrice(String(BigInt(item.priceUzs) * BigInt(item.quantity)))}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-4 font-semibold">
          <span className="text-sm text-fg">{t('order.total')}</span>
          <span className="tabular-nums text-accent">{formatPrice(order.totalUzs)}</span>
        </div>
      </div>

      {/* Payment + Address */}
      <div className="grid gap-4 sm:grid-cols-2">
        {order.payment && (
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2 text-faint">
              <CreditCard className="h-4 w-4" />
              <h3 className="text-xs font-medium uppercase tracking-wide">{t('order.payment')}</h3>
            </div>
            <p className="text-sm text-fg">{PAYMENT_PROVIDER_LABELS[order.payment.provider] ?? order.payment.provider}</p>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[order.payment.status] ?? 'bg-elevated text-muted'}`}>
              {order.payment.status}
            </span>
          </div>
        )}
        {order.address && (
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2 text-faint">
              <MapPin className="h-4 w-4" />
              <h3 className="text-xs font-medium uppercase tracking-wide">{t('order.delivery')}</h3>
            </div>
            <p className="text-sm text-fg">{order.address.line1}</p>
            <p className="text-xs text-muted">{[order.address.city, order.address.region].filter(Boolean).join(', ')}</p>
            {order.address.lat && order.address.lng && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${order.address.lat}&mlon=${order.address.lng}#map=16/${order.address.lat}/${order.address.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-accent hover:underline"
              >
                {t('profile.viewOnMap')}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Cancel */}
      {order.status === 'PENDING' && (
        <div className="border-t border-line pt-6">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
