'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n';

const line = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.1 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  const { t } = useT();
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
      <div className="aurora" aria-hidden />
      {/* grid lines */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 80%)',
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-4xl text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-fg/5 px-4 py-1.5 text-xs text-muted backdrop-blur"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent-2" />
          {t('hero.eyebrow')}
        </m.div>

        <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
          <m.span custom={0} variants={line} initial="hidden" animate="show" className="block">
            {t('hero.title1')}
          </m.span>
          <m.span
            custom={1}
            variants={line}
            initial="hidden"
            animate="show"
            className="block text-gradient"
          >
            {t('hero.title2')}
          </m.span>
        </h1>

        <m.p
          custom={2}
          variants={line}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
        >
          {t('hero.subtitle')}
        </m.p>

        <m.div
          custom={3}
          variants={line}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/catalog"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] px-7 text-sm font-medium text-white shadow-[0_10px_40px_-10px_var(--color-accent)] transition-transform hover:-translate-y-0.5"
          >
            {t('hero.cta')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/catalog?onSale=true"
            className="inline-flex h-12 items-center rounded-full border border-line px-7 text-sm font-medium text-fg transition-colors hover:border-accent/60 hover:text-accent-ink"
          >
            {t('hero.ctaDeals')}
          </Link>
        </m.div>
      </div>
    </section>
  );
}
