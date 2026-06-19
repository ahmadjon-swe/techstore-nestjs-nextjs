'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useWishlist } from '@/store/wishlist';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

export function WishlistButton({
  productId,
  className = '',
  size = 'md',
}: {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const router = useRouter();
  const { t } = useT();
  const load = useWishlist((s) => s.load);
  const toggle = useWishlist((s) => s.toggle);
  const saved = useWishlist((s) => s.ids.has(productId));

  useEffect(() => {
    load();
  }, [load]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle(productId);
    if (result === 'auth') {
      toast.error(t('nav.signin'));
      router.push('/auth/login');
      return;
    }
    toast.success(result === 'saved' ? t('card.saved') : t('card.save'));
  }

  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? t('card.saved') : t('card.save')}
      className={cn(
        'grid place-items-center rounded-full border backdrop-blur-md transition-all active:scale-90',
        dim,
        saved
          ? 'border-danger/40 bg-danger/15 text-danger'
          : 'border-line bg-surface/70 text-muted hover:text-fg',
        className,
      )}
    >
      <Heart className={cn(size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]', saved && 'fill-current')} />
    </button>
  );
}
