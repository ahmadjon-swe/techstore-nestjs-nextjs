'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Search, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/catalog', label: 'All' },
  { href: '/catalog?condition=NEW', label: 'New' },
  { href: '/catalog?condition=USED', label: 'Used' },
];

export function HeaderShell({ authed, cart }: { authed: boolean; cart: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/catalog?search=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          'transition-all duration-500',
          scrolled
            ? 'glass border-b border-line/80 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.8)]'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-sm font-bold text-white shadow-[0_0_20px_-4px_var(--color-accent)]">
              T
              <span className="absolute inset-0 rounded-lg opacity-0 ring-2 ring-accent/50 transition-opacity group-hover:opacity-100" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">TechStore</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-muted hover:bg-white/5 hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {cart}

            <Link
              href={authed ? '/profile' : '/auth/login'}
              aria-label="Account"
              className="hidden h-10 w-10 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg sm:grid"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-white/5 hover:text-fg md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Expanding search bar */}
        <AnimatePresence>
          {searchOpen && (
            <m.form
              onSubmit={submitSearch}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-line/60"
            >
              <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
                <Search className="h-5 w-5 shrink-0 text-faint" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search iPhone, MacBook, Galaxy…"
                  className="w-full bg-transparent text-sm text-fg placeholder:text-faint focus:outline-none"
                />
                <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
                  ↵
                </kbd>
              </div>
            </m.form>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <m.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="glass border-b border-line px-4 py-4 md:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-4 py-3 text-sm text-fg hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={authed ? '/profile' : '/auth/login'}
              className="block rounded-lg px-4 py-3 text-sm text-fg hover:bg-white/5"
            >
              {authed ? 'Account' : 'Sign in'}
            </Link>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
