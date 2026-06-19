'use client';

import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import type { Review } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { Reveal } from '@/components/motion/Reveal';

export function ProductBreadcrumb({ title }: { title: string }) {
  const { t } = useT();
  return (
    <nav className="mb-8 flex items-center gap-1.5 text-xs text-faint">
      <Link href="/" className="hover:text-fg">{t('nav.home')}</Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/catalog" className="hover:text-fg">{t('nav.all')}</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="text-muted">{title}</span>
    </nav>
  );
}

export function ProductReviews({ reviews }: { reviews: Review[] }) {
  const { t } = useT();
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <Reveal as="section" className="mt-20 border-t border-line pt-12">
      <div className="mb-8 flex items-baseline gap-3">
        <h2 className="font-display text-2xl tracking-tight">{t('detail.reviews')}</h2>
        <span className="flex items-center gap-1 text-sm text-muted">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <strong className="text-fg">{avg.toFixed(1)}</strong> · {reviews.length}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-surface/40 p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{r.user?.name ?? t('detail.reviews.anon')}</span>
              <span className="text-xs text-faint">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mb-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-warning text-warning' : 'fill-line text-line'}`}
                />
              ))}
            </div>
            {r.body && <p className="text-sm leading-relaxed text-muted">{r.body}</p>}
          </div>
        ))}
      </div>
    </Reveal>
  );
}
