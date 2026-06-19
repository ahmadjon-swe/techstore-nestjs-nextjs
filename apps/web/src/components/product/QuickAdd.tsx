'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartUI } from '@/store/cart';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

export function QuickAdd({ variantId, disabled }: { variantId: string; disabled?: boolean }) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const bump = useCartUI((s) => s.bump);
  const router = useRouter();

  async function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || loading) return;
    setLoading(true);
    bump(1);
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      if (res.status === 401) {
        bump(-1);
        toast.error(t('detail.signInToAdd'));
        router.push('/auth/login');
        return;
      }
      if (!res.ok) {
        bump(-1);
        toast.error(t('common.error'));
        return;
      }
      setDone(true);
      toast.success(t('detail.addedToCart'));
      setTimeout(() => setDone(false), 1600);
    } catch {
      bump(-1);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={add}
      disabled={disabled || loading}
      className={cn(
        'flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-white backdrop-blur-md transition-all',
        'bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] shadow-[0_8px_30px_-8px_var(--color-accent)]',
        'disabled:opacity-50 active:scale-[0.98]',
      )}
    >
      {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {disabled ? t('common.soldOut') : done ? t('detail.added') : t('detail.quickAdd')}
    </button>
  );
}
