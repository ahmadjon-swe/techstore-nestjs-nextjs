'use client';

import Link from 'next/link';
import { useT, type TKey } from '@/lib/i18n';

const COLUMNS: { title: TKey; links: { href: string; label: TKey }[] }[] = [
  {
    title: 'footer.shop',
    links: [
      { href: '/catalog?condition=NEW', label: 'footer.newDevices' },
      { href: '/catalog?condition=USED', label: 'footer.certifiedUsed' },
      { href: '/catalog', label: 'footer.allProducts' },
    ],
  },
  {
    title: 'footer.account',
    links: [
      { href: '/orders', label: 'footer.myOrders' },
      { href: '/profile', label: 'nav.account' },
      { href: '/cart', label: 'nav.cart' },
    ],
  },
  {
    title: 'footer.company',
    links: [
      { href: '/', label: 'footer.about' },
      { href: '/', label: 'footer.warranty' },
      { href: '/', label: 'footer.contact' },
    ],
  },
];

export function Footer() {
  const { t } = useT();
  return (
    <footer className="footer-surface relative mt-24">
      {/* Top accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-accent),transparent)] opacity-50" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white shadow-[0_0_16px_-4px_var(--color-accent)]">
              T
            </span>
            <span className="font-display text-lg font-semibold text-white/90">TechStore</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">{t('footer.tagline')}</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/30">
              {t(col.title)}
            </p>
            <ul className="space-y-3">
              {col.links.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="text-sm text-white/50 transition-colors hover:text-white/90">
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/30 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} TechStore. {t('footer.rights')}</p>
          <p className="font-mono">Tashkent · Uzbekistan</p>
        </div>
      </div>
    </footer>
  );
}
