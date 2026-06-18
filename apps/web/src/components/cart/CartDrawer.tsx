'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartUI } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { Cart } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const img = (u?: string) => (u ? (u.startsWith('http') ? u : `${API_URL}${u}`) : null);

export function CartDrawer() {
  const isOpen = useCartUI((s) => s.isOpen);
  const close = useCartUI((s) => s.close);
  const setCount = useCartUI((s) => s.setCount);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      const data: Cart = await res.json();
      setCart(data);
      setCount((data.items ?? []).reduce((s, i) => s + i.quantity, 0));
    } finally {
      setLoading(false);
    }
  }, [setCount]);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <m.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="glass fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-line"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <ShoppingBag className="h-5 w-5 text-accent-2" /> Your cart
              </h2>
              <button
                onClick={close}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && items.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">Loading…</p>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-line bg-white/5">
                    <ShoppingBag className="h-7 w-7 text-faint" />
                  </div>
                  <p className="text-muted">Your cart is empty.</p>
                  <Link
                    href="/catalog"
                    onClick={close}
                    className="rounded-full bg-white/5 px-5 py-2 text-sm text-fg hover:bg-white/10"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => {
                    const src = img(item.variant.product?.images?.[0]?.url);
                    return (
                      <li
                        key={item.id}
                        className="flex gap-3 rounded-xl border border-line bg-bg-2/40 p-3"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-elevated">
                          {src && (
                            <Image src={src} alt="" fill className="object-contain p-1" sizes="64px" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium">
                            {item.variant.product?.titleEn ?? 'Product'}
                          </p>
                          <p className="font-mono text-sm text-muted">
                            {formatPrice(item.variant.priceUzs)}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <button
                              onClick={() => setQty(item.variantId, item.quantity - 1)}
                              className="grid h-6 w-6 place-items-center rounded-md border border-line hover:bg-white/5"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => setQty(item.variantId, item.quantity + 1)}
                              className="grid h-6 w-6 place-items-center rounded-md border border-line hover:bg-white/5"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setQty(item.variantId, 0)}
                              className="ml-auto grid h-6 w-6 place-items-center rounded-md text-faint hover:text-danger"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="font-mono text-lg font-semibold">
                    {formatPrice(cart?.total ?? '0')}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] text-sm font-medium text-white shadow-[0_10px_40px_-10px_var(--color-accent)] transition-transform hover:-translate-y-0.5"
                >
                  Checkout
                </Link>
              </div>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
