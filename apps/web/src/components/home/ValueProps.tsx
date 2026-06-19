'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Truck } from 'lucide-react';
import { useT, type TKey } from '@/lib/i18n';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';

const PROPS: { icon: typeof ShieldCheck; title: TKey; body: TKey }[] = [
  { icon: ShieldCheck, title: 'home.prop.grading.title', body: 'home.prop.grading.body' },
  { icon: Zap, title: 'home.prop.checkout.title', body: 'home.prop.checkout.body' },
  { icon: Truck, title: 'home.prop.delivery.title', body: 'home.prop.delivery.body' },
];

export function ValueProps() {
  const { t } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <RevealGroup className="grid gap-4 sm:grid-cols-3">
        {PROPS.map((v) => (
          <RevealItem key={v.title}>
            <div className="border-glow flex h-full items-start gap-4 rounded-2xl border border-line bg-surface/40 p-6">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink">
                <v.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">{t(v.title)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{t(v.body)}</p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export function HomeCTA() {
  const { t } = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="border-glow relative overflow-hidden rounded-3xl border border-line bg-[radial-gradient(120%_120%_at_0%_0%,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_60%)] px-8 py-16 text-center sm:py-24">
          <div className="aurora opacity-30" aria-hidden />
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">{t('home.cta.body')}</p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] px-8 text-sm font-medium text-white shadow-[0_10px_40px_-10px_var(--color-accent)] transition-transform hover:-translate-y-0.5"
          >
            {t('home.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
