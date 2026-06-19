'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CartActionsProps {
  variantId: string;
  quantity: number;
}

export function CartActions({ variantId, quantity }: CartActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newQty: number) {
    setLoading(true);
    if (newQty === 0) {
      await fetch(`/api/cart/items/${variantId}`, { method: 'DELETE' });
    } else {
      await fetch(`/api/cart/items/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => update(quantity - 1)}
        disabled={loading}
        className="w-7 h-7 flex items-center justify-center rounded border border-line hover:bg-fg/5 text-fg transition-colors disabled:opacity-40"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="w-6 text-center text-sm tabular-nums">{quantity}</span>
      <button
        onClick={() => update(quantity + 1)}
        disabled={loading}
        className="w-7 h-7 flex items-center justify-center rounded border border-line hover:bg-fg/5 text-fg transition-colors disabled:opacity-40"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
