import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/catalog?condition=NEW', label: 'New devices' },
      { href: '/catalog?condition=USED', label: 'Certified used' },
      { href: '/catalog', label: 'All products' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/orders', label: 'My orders' },
      { href: '/profile', label: 'Profile' },
      { href: '/cart', label: 'Cart' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/', label: 'About' },
      { href: '/', label: 'Warranty' },
      { href: '/', label: 'Support' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-accent),transparent)] opacity-40" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white">
              T
            </span>
            <span className="font-display text-lg font-semibold">TechStore</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            New and certified pre-owned technology in Tashkent. Engineered experience, honest
            grading, instant checkout.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-faint">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="text-sm text-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-faint sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} TechStore. All rights reserved.</p>
          <p className="font-mono">Tashkent · Uzbekistan</p>
        </div>
      </div>
    </footer>
  );
}
