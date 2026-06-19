'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartUI } from '@/store/cart';
import { useT } from '@/lib/i18n';

export function CartButton() {
  const { t } = useT();
  const count = useCartUI((s) => s.count);
  const setCount = useCartUI((s) => s.setCount);

  useEffect(() => {
    let alive = true;
    fetch('/api/cart/count')
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => alive && setCount(d.count ?? 0))
      .catch(() => {});
    return () => { alive = false; };
  }, [setCount]);

  return (
    <Link
      href="/cart"
      aria-label={`${t('nav.cart')} (${count})`}
      className="relative grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      <AnimatePresence>
        {count > 0 && (
          <m.span
            key={count}
            initial={{ scale: 0, y: -4 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] px-1 text-[10px] font-bold text-white shadow-[0_0_12px_-2px_var(--color-accent)]"
          >
            {count}
          </m.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
