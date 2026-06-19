'use client';

import { useT } from '@/lib/i18n';

export function CatalogHeading({ total, search }: { total: number; search?: string }) {
  const { t } = useT();
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent-2">{t('nav.catalog')}</p>
      <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
        {search ? `“${search}”` : t('catalog.title')}
      </h1>
      <p className="mt-2 text-sm text-muted">{t('catalog.products', { n: total })}</p>
    </div>
  );
}
