'use client';

import Link from 'next/link';
import { useT } from '@/lib/i18n';

export function CatalogEmpty() {
  const { t } = useT();
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line py-28 text-center">
      <p className="text-lg text-muted">{t('catalog.empty')}</p>
      <Link href="/catalog" className="mt-3 text-sm text-accent-ink hover:underline">
        {t('catalog.clearAll')}
      </Link>
    </div>
  );
}
