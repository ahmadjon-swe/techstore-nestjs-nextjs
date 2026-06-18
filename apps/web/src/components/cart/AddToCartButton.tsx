'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface AddToCartButtonProps {
  variantId: string;
  disabled?: boolean;
}

export function AddToCartButton({ variantId, disabled }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      if (res.status === 401) {
        window.location.href = '/auth/login';
        return;
      }
      if (res.ok) {
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleAdd}
      loading={loading}
      disabled={disabled}
    >
      {done ? '✓ Added' : 'Add to cart'}
    </Button>
  );
}
