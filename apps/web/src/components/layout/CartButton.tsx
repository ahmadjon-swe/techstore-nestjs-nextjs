'use client';

import { useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartUI } from '@/store/cart';

export function CartButton() {
  const count = useCartUI((s) => s.count);
  const open = useCartUI((s) => s.open);
  const setCount = useCartUI((s) => s.setCount);

  // Hydrate the badge from the server cart once on mount.
  useEffect(() => {
    let alive = true;
    fetch('/api/cart/count')
      .then((r) => (r.ok ? r.json() : { count: 0 }))
      .then((d) => alive && setCount(d.count ?? 0))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [setCount]);

  return (
    <button
      onClick={open}
      aria-label={`Cart (${count} items)`}
      className="relative grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg"
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
    </button>
  );
}
