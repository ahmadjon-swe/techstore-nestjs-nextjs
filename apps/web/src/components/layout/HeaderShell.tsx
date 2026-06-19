'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Search, User, Menu, X, Heart, Tag, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useT, localized } from '@/lib/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutButton } from '@/components/auth/LogoutButton';

type NavCategory = { slug: string; nameUz: string; nameRu: string; nameEn: string };

export function HeaderShell({
  authed,
  isAdmin = false,
  categories,
  cart,
}: {
  authed: boolean;
  isAdmin?: boolean;
  categories: NavCategory[];
  cart: ReactNode;
}) {
  const { t, locale } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sidebarOpen || mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, mobileOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/catalog?search=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40">
        <div
          className={cn(
            'transition-all duration-500',
            scrolled
              ? 'header-scrolled border-b border-line/80 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.8)]'
              : 'header-default border-b border-line/20',
          )}
        >
          <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
            {/* Brand — left */}
            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-2))] text-xs font-bold text-white shadow-[0_0_16px_-4px_var(--color-accent)]">
                T
                <span className="absolute inset-0 rounded-lg opacity-0 ring-2 ring-accent/50 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="font-display text-base font-semibold tracking-tight">TechStore</span>
            </Link>

            {/* Desktop nav — centered */}
            <nav className="hidden flex-1 items-center justify-center overflow-x-auto scrollbar-none lg:flex">
              <div className="flex items-center gap-0.5 whitespace-nowrap">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/catalog?category=${c.slug}`}
                    className="rounded-full px-2.5 py-1.5 text-xs text-muted hover:bg-fg/5 hover:text-fg"
                  >
                    {localized(c, 'name', locale)}
                  </Link>
                ))}
                <Link
                  href="/catalog?onSale=true"
                  className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-used hover:bg-fg/5"
                >
                  <Tag className="h-3 w-3" />
                  {t('nav.deals')}
                </Link>
              </div>
            </nav>

            {/* Right-side actions */}
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                aria-label={t('nav.search')}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
              >
                <Search className="h-[17px] w-[17px]" />
              </button>

              {cart}

              {/* Sidebar/account toggle */}
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Account menu"
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
              >
                <User className="h-[17px] w-[17px]" />
              </button>

              {/* Hamburger — categories nav on mobile/tablet */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menu"
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg lg:hidden"
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
                    placeholder={t('nav.searchPlaceholder')}
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

        {/* Mobile/tablet category menu */}
        <AnimatePresence>
          {mobileOpen && (
            <m.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mobile-menu-surface border-b border-line px-4 py-3 lg:hidden"
            >
              <Link href="/catalog" className="block rounded-lg px-4 py-2.5 text-sm text-fg hover:bg-fg/5">
                {t('nav.all')}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalog?category=${c.slug}`}
                  className="block rounded-lg px-4 py-2.5 text-sm text-fg hover:bg-fg/5"
                >
                  {localized(c, 'name', locale)}
                </Link>
              ))}
              <Link
                href="/catalog?onSale=true"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm text-used hover:bg-fg/5"
              >
                <Tag className="h-3.5 w-3.5" />
                {t('nav.deals')}
              </Link>
            </m.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Right account sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <m.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col sidebar-surface border-l border-line/60"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between border-b border-line/60 px-5 py-4">
                <span className="font-display text-sm font-semibold">
                  {authed ? t('nav.account') : t('nav.signin')}
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar nav */}
              <nav className="flex flex-1 flex-col gap-1 p-3">
                <Link
                  href={authed ? '/profile' : '/auth/login'}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-fg hover:bg-fg/5"
                >
                  <User className="h-4 w-4 shrink-0 text-muted" />
                  {authed ? t('nav.account') : t('nav.signin')}
                </Link>

                {authed && (
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-fg hover:bg-fg/5"
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0 text-muted" />
                    {t('nav.orders')}
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-fg hover:bg-fg/5"
                >
                  <Heart className="h-4 w-4 shrink-0 text-muted" />
                  {t('nav.wishlist')}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-accent-ink hover:bg-fg/5"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    {t('nav.admin')}
                  </Link>
                )}
              </nav>

              {/* Sidebar footer — theme, language, logout */}
              <div className="space-y-1 border-t border-line/60 p-4">
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="text-xs text-faint">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="text-xs text-faint">Language</span>
                  <LanguageSwitcher />
                </div>
                {authed && (
                  <div className="pt-2">
                    <LogoutButton />
                  </div>
                )}
              </div>
            </m.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
