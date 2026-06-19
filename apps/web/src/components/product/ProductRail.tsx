'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ProductSummary } from '@/lib/api';
import { useT, localized, type TKey } from '@/lib/i18n';
import { Reveal } from '@/components/motion/Reveal';
import { ProductCard } from './ProductCard';

type LocalizedNames = { nameUz: string; nameRu: string; nameEn: string };

interface ProductRailProps {
  /** A translation key, a literal string, or a localizable category name object. */
  title: TKey | { literal: string } | { category: LocalizedNames };
  eyebrowKey?: TKey;
  href?: string;
  products: ProductSummary[];
}

export function ProductRail({ title, eyebrowKey, href, products }: ProductRailProps) {
  const { t, locale } = useT();
  if (products.length === 0) return null;
  const heading =
    typeof title === 'object'
      ? 'literal' in title
        ? title.literal
        : localized(title.category, 'name', locale)
      : t(title);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <Reveal className="mb-6 flex items-end justify-between gap-4">
        <div>
          {eyebrowKey && <p className="mb-1 text-xs uppercase tracking-widest text-accent-2">{t(eyebrowKey)}</p>}
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{heading}</h2>
        </div>
        {href && (
          <Link href={href} className="group hidden items-center gap-1.5 text-sm text-muted hover:text-fg sm:flex">
            {t('home.viewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </Reveal>

      {/* Horizontal scrollable row — one row, drag/swipe to see more */}
      <div className="-mx-4 sm:-mx-6">
        <div className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 scrollbar-none sm:px-6">
          {products.map((p) => (
            <div key={p.id} className="w-[200px] shrink-0 sm:w-[240px] lg:w-[260px]">
              <ProductCard product={p} />
            </div>
          ))}
          {href && (
            <Link
              href={href}
              className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-line/60 text-sm text-muted hover:border-accent/40 hover:text-fg"
            >
              <ArrowRight className="h-5 w-5" />
              {t('home.viewAll')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
