'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartUI } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { ProductCard } from '@/components/product/ProductCard';
import type { Cart, ProductSummary } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const img = (u?: string) => (u ? (u.startsWith('http') ? u : `${API_URL}${u}`) : null);

export default function CartPage() {
  const { t, locale } = useT();
  const setCount = useCartUI((s) => s.setCount);

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ProductSummary[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      if (!res.ok) { setCart(null); return; }
      const data: Cart = await res.json();
      setCart(data);
      const n = (data.items ?? []).reduce((s, i) => s + i.quantity, 0);
      setCount(n);
      // Fetch related products based on first item's category
      if (data.items?.[0]) {
        const slug = data.items[0].variant?.product?.slug;
        if (slug) {
          const r = await fetch(`/api/catalog/products/${slug}/related?limit=4`).then((res) => res.json()).catch(() => []);
          setRelated(Array.isArray(r) ? r : []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => { refresh(); }, [refresh]);

  async function setQty(variantId: string, quantity: number) {
    if (quantity <= 0) {
      await fetch(`/api/cart/items/${variantId}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/cart/items/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
    }
    refresh();
  }

  const items = cart?.items ?? [];

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl border border-line bg-surface text-faint">
          <ShoppingBag className="h-9 w-9" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-fg">{t('cart.empty')}</h1>
          <p className="mt-1 text-sm text-muted">{t('cart.emptyHint')}</p>
        </div>
        <Link
          href="/catalog"
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          {t('cart.browse')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <h1 className="font-display text-3xl text-fg">{t('cart.title')}</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="space-y-3 lg:col-span-2">
          <AnimatePresence initial={false}>
            {items.map((item) => {
              const src = img(item.variant.product?.images?.[0]?.url);
              const title = item.variant.product
                ? (locale === 'uz' ? (item.variant.product as any).titleUz
                  : locale === 'ru' ? (item.variant.product as any).titleRu
                  : item.variant.product.titleEn)
                : 'Product';
              return (
                <m.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 rounded-2xl border border-line bg-surface p-4"
                >
                  {/* Image */}
                  <Link href={`/products/${item.variant.product?.slug ?? ''}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-elevated">
                    {src && <Image src={src} alt="" fill className="object-contain p-1.5" sizes="80px" />}
                  </Link>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/products/${item.variant.product?.slug ?? ''}`} className="line-clamp-2 text-sm font-medium text-fg hover:text-accent-ink">
                      {title}
                    </Link>
                    {(item.variant.storage || item.variant.color) && (
                      <p className="text-xs text-faint">
                        {[item.variant.storage, item.variant.color].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="font-mono text-sm font-semibold text-fg">
                      {formatPrice(String(BigInt(item.variant.priceUzs) * BigInt(item.quantity)))}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => setQty(item.variantId, 0)}
                      className="text-faint transition-colors hover:text-danger"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(item.variantId, item.quantity - 1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line hover:bg-fg/5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => setQty(item.variantId, item.quantity + 1)}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-line hover:bg-fg/5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 sticky top-20">
            <h2 className="font-medium text-fg">{t('checkout.summary')}</h2>

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-muted">
                  <span className="truncate mr-3 max-w-[160px]">
                    {item.variant.product?.titleEn ?? 'Item'} ×{item.quantity}
                  </span>
                  <span className="tabular-nums shrink-0">
                    {formatPrice(String(BigInt(item.variant.priceUzs) * BigInt(item.quantity)))}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3 flex justify-between font-semibold">
              <span>{t('checkout.total')}</span>
              <span className="tabular-nums text-accent">{formatPrice(cart?.total ?? '0')}</span>
            </div>

            <Link
              href="/checkout"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] text-sm font-semibold text-white shadow-[0_8px_30px_-10px_var(--color-accent)] hover:opacity-95 transition-opacity"
            >
              {t('cart.checkout')} <ArrowRight className="h-4 w-4" />
            </Link>

            <Link href="/catalog" className="block text-center text-xs text-muted hover:text-fg">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="space-y-5 border-t border-line pt-10">
          <h2 className="font-display text-xl text-fg">{t('detail.related')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
