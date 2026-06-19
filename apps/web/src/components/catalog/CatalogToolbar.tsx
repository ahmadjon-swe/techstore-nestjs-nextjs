'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react';
import { useT, localized } from '@/lib/i18n';
import { cn } from '@/lib/cn';

type Cat = { slug: string; nameUz: string; nameRu: string; nameEn: string };
type BrandT = { slug: string; name: string };

const SORTS = [
  { value: 'newest', key: 'catalog.sort.newest' as const },
  { value: 'price-asc', key: 'catalog.sort.priceAsc' as const },
  { value: 'price-desc', key: 'catalog.sort.priceDesc' as const },
  { value: 'discount', key: 'catalog.sort.discount' as const },
];

export function CatalogToolbar({
  params,
  categories,
  brands,
}: {
  params: Record<string, string>;
  categories: Cat[];
  brands: BrandT[];
}) {
  const { t, locale } = useT();
  const router = useRouter();
  const [search, setSearch] = useState(params.search ?? '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // draft filter state (applied on "Apply")
  const [condition, setCondition] = useState(params.condition ?? '');
  const [category, setCategory] = useState(params.category ?? '');
  const [brand, setBrand] = useState(params.brand ?? '');
  const [minPrice, setMinPrice] = useState(params.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? '');
  const [onSale, setOnSale] = useState(params.onSale === 'true');

  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Keep the draft popover state in sync with the applied URL (the client component
  // persists across soft navigations — e.g. clicking a category in the header).
  useEffect(() => {
    setSearch(params.search ?? '');
    setCondition(params.condition ?? '');
    setCategory(params.category ?? '');
    setBrand(params.brand ?? '');
    setMinPrice(params.minPrice ?? '');
    setMaxPrice(params.maxPrice ?? '');
    setOnSale(params.onSale === 'true');
  }, [params.search, params.condition, params.category, params.brand, params.minPrice, params.maxPrice, params.onSale]);

  const activeCount = useMemo(
    () => [condition, category, brand, minPrice, maxPrice, onSale ? '1' : ''].filter(Boolean).length,
    [condition, category, brand, minPrice, maxPrice, onSale],
  );

  function push(next: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      search: search.trim() || undefined,
      condition: condition || undefined,
      category: category || undefined,
      brand: brand || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      onSale: onSale ? 'true' : undefined,
      sort: params.sort || undefined,
      ...next,
    };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    router.push(`/catalog${p.toString() ? `?${p}` : ''}`);
  }

  function applyFilters() {
    setFilterOpen(false);
    push({});
  }

  function clearFilters() {
    setCondition(''); setCategory(''); setBrand(''); setMinPrice(''); setMaxPrice(''); setOnSale(false);
    setFilterOpen(false);
    const p = new URLSearchParams();
    if (search.trim()) p.set('search', search.trim());
    if (params.sort) p.set('sort', params.sort);
    router.push(`/catalog${p.toString() ? `?${p}` : ''}`);
  }

  const currentSort = SORTS.find((s) => s.value === (params.sort ?? 'newest')) ?? SORTS[0];

  // Applied-filter chips (reflect the URL, not the draft state)
  const chips: { key: string; label: string; clear: Record<string, undefined> }[] = [];
  if (params.condition) chips.push({ key: 'condition', label: params.condition === 'NEW' ? t('nav.new') : t('nav.used'), clear: { condition: undefined } });
  if (params.category) {
    const c = categories.find((x) => x.slug === params.category);
    chips.push({ key: 'category', label: c ? localized(c, 'name', locale) : params.category, clear: { category: undefined } });
  }
  if (params.brand) {
    const b = brands.find((x) => x.slug === params.brand);
    chips.push({ key: 'brand', label: b ? b.name : params.brand, clear: { brand: undefined } });
  }
  if (params.minPrice) chips.push({ key: 'min', label: `${t('catalog.priceMin')} ${params.minPrice}`, clear: { minPrice: undefined } });
  if (params.maxPrice) chips.push({ key: 'max', label: `${t('catalog.priceMax')} ${params.maxPrice}`, clear: { maxPrice: undefined } });
  if (params.onSale === 'true') chips.push({ key: 'sale', label: t('catalog.onSale'), clear: { onSale: undefined } });

  function removeChip(clear: Record<string, undefined>) {
    if ('condition' in clear) setCondition('');
    if ('category' in clear) setCategory('');
    if ('brand' in clear) setBrand('');
    if ('minPrice' in clear) setMinPrice('');
    if ('maxPrice' in clear) setMaxPrice('');
    if ('onSale' in clear) setOnSale(false);
    push(clear);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); push({}); }}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-surface/60 px-3.5 py-2.5 focus-within:border-accent/60"
        >
          <Search className="h-4 w-4 shrink-0 text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('nav.search')}
            className="w-full bg-transparent text-sm text-fg placeholder:text-faint focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => { setSearch(''); push({ search: undefined }); }} aria-label="Clear search">
              <X className="h-4 w-4 text-faint hover:text-fg" />
            </button>
          )}
        </form>

        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex h-[42px] items-center gap-2 rounded-xl border border-line bg-surface/60 px-3.5 text-sm text-muted hover:text-fg"
          >
            <span className="hidden sm:inline">{t('catalog.sort')}:</span>
            <span className="text-fg">{t(currentSort.key)}</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <div className="glass absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-line p-1">
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => { setSortOpen(false); push({ sort: s.value === 'newest' ? undefined : s.value }); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    s.value === currentSort.value ? 'bg-accent/10 text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg',
                  )}
                >
                  {t(s.key)}
                  {s.value === currentSort.value && <Check className="h-3.5 w-3.5 text-accent-ink" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter */}
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={cn(
              'flex h-[42px] items-center gap-2 rounded-xl border px-3.5 text-sm transition-colors',
              activeCount > 0 ? 'border-accent/50 bg-accent/10 text-fg' : 'border-line bg-surface/60 text-muted hover:text-fg',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">{t('catalog.filters')}</span>
            {activeCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
                {activeCount}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="glass absolute right-0 z-40 mt-2 w-[min(90vw,360px)] space-y-5 rounded-2xl border border-line p-5 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]">
              {/* Condition */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-faint">{t('catalog.condition')}</p>
                <div className="flex gap-2">
                  {[
                    { v: '', label: t('catalog.all') },
                    { v: 'NEW', label: t('nav.new') },
                    { v: 'USED', label: t('nav.used') },
                  ].map((c) => (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => setCondition(c.v)}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-1.5 text-sm transition-colors',
                        condition === c.v ? 'border-accent/50 bg-accent/10 text-fg' : 'border-line text-muted hover:text-fg',
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-faint">{t('catalog.price')}</p>
                <div className="flex items-center gap-2">
                  <input
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('catalog.priceMin')}
                    className="w-full rounded-lg border border-line bg-surface/60 px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent/60 focus:outline-none"
                  />
                  <span className="text-faint">—</span>
                  <input
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('catalog.priceMax')}
                    className="w-full rounded-lg border border-line bg-surface/60 px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* On sale */}
              <button
                type="button"
                onClick={() => setOnSale((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-fg"
              >
                {t('catalog.onSale')}
                <span className={cn('grid h-5 w-5 place-items-center rounded border', onSale ? 'border-accent bg-accent text-white' : 'border-line')}>
                  {onSale && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-faint">{t('catalog.category')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => setCategory(category === c.slug ? '' : c.slug)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs transition-colors',
                          category === c.slug ? 'border-accent/50 bg-accent/10 text-fg' : 'border-line text-muted hover:text-fg',
                        )}
                      >
                        {localized(c, 'name', locale)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand */}
              {brands.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-faint">{t('catalog.brand')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((b) => (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => setBrand(brand === b.slug ? '' : b.slug)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs transition-colors',
                          brand === b.slug ? 'border-accent/50 bg-accent/10 text-fg' : 'border-line text-muted hover:text-fg',
                        )}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:text-fg"
                >
                  {t('catalog.clear')}
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 rounded-lg bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] px-3 py-2 text-sm font-medium text-white"
                >
                  {t('catalog.apply')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applied filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.clear)}
              className="group flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs text-muted hover:border-faint hover:text-fg"
            >
              {chip.label}
              <X className="h-3 w-3 group-hover:text-danger" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full px-2 py-1 text-xs text-faint underline-offset-2 hover:text-fg hover:underline"
          >
            {t('catalog.clear')}
          </button>
        </div>
      )}
    </div>
  );
}
