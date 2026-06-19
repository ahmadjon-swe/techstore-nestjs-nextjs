'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export function WishlistHeading({ count }: { count: number }) {
  const { t } = useT();
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent-2">{t('nav.account')}</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">{t('wishlist.title')}</h1>
      <p className="mt-2 text-sm text-muted">{t('catalog.products', { n: count })}</p>
    </div>
  );
}

export function WishlistEmptyState() {
  const { t } = useT();
  return (
    <>
      <p className="text-lg text-muted">{t('wishlist.empty')}</p>
      <Link
        href="/catalog"
        className="rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] px-6 py-2.5 text-sm font-medium text-white"
      >
        {t('wishlist.browse')}
      </Link>
    </>
  );
}
