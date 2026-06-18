import type { Metadata } from 'next';
import Link from 'next/link';
import { catalog, CatalogFilters } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { CatalogSearch } from '@/components/catalog/CatalogSearch';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse new and certified used devices — smartphones, laptops and more.',
};

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

const CONDITIONS = [
  { label: 'All', value: undefined },
  { label: 'New', value: 'NEW' },
  { label: 'Used', value: 'USED' },
];

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: CatalogFilters = {
    condition: params.condition as 'NEW' | 'USED' | undefined,
    categorySlug: params.category,
    brandSlug: params.brand,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
    limit: 24,
  };

  const [products, categories, brands] = await Promise.all([
    catalog.list(filters).catch(() => ({ total: 0, page: 1, limit: 24, items: [] })),
    catalog.categories().catch(() => []),
    catalog.brands().catch(() => []),
  ]);

  const totalPages = Math.ceil(products.total / 24);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams(params as Record<string, string>);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    p.delete('page');
    const qs = p.toString();
    return `/catalog${qs ? `?${qs}` : ''}`;
  }

  const FilterGroup = ({
    title,
    items,
    active,
    param,
  }: {
    title: string;
    items: { slug: string; name: string }[];
    active?: string;
    param: string;
  }) =>
    items.length === 0 ? null : (
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-faint">{title}</p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href={buildUrl({ [param]: undefined })}
              className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                !active ? 'bg-white/5 text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              All {title.toLowerCase()}
            </Link>
          </li>
          {items.map((it) => (
            <li key={it.slug}>
              <Link
                href={buildUrl({ [param]: it.slug })}
                className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active === it.slug ? 'bg-white/5 text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {it.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header band */}
      <div className="mb-10 border-b border-line pb-8">
        <p className="text-xs uppercase tracking-widest text-accent-2">Catalog</p>
        <h1 className="mt-1 font-display text-4xl tracking-tight sm:text-5xl">
          {filters.condition === 'NEW' ? 'New devices' : filters.condition === 'USED' ? 'Certified used' : 'All devices'}
        </h1>
        <p className="mt-2 text-sm text-muted">{products.total} products</p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Sidebar */}
        <aside className="space-y-8 lg:w-60 lg:shrink-0">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-faint">Condition</p>
            <div className="flex gap-2 lg:flex-col">
              {CONDITIONS.map((c) => {
                const isActive = filters.condition === c.value || (!filters.condition && !c.value);
                return (
                  <Link
                    key={c.label}
                    href={buildUrl({ condition: c.value })}
                    className={`rounded-full px-4 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] text-white shadow-[0_6px_24px_-8px_var(--color-accent)]'
                        : 'border border-line text-muted hover:text-fg'
                    }`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <CatalogSearch defaultValue={params.search} params={params} />

          <FilterGroup
            title="Category"
            param="category"
            active={filters.categorySlug}
            items={categories.map((c) => ({ slug: c.slug, name: c.nameEn }))}
          />
          <FilterGroup
            title="Brand"
            param="brand"
            active={filters.brandSlug}
            items={brands.map((b) => ({ slug: b.slug, name: b.name }))}
          />
        </aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {products.items.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-line py-28 text-center">
              <p className="text-lg text-muted">No products match these filters.</p>
              <Link href="/catalog" className="mt-3 text-sm text-accent-ink hover:underline">
                Clear all filters
              </Link>
            </div>
          ) : (
            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5" stagger={0.05}>
              {products.items.map((p) => (
                <RevealItem key={p.id}>
                  <ProductCard product={p} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={buildUrl({ page: String(n) })}
                  className={`grid h-10 w-10 place-items-center rounded-full text-sm transition-colors ${
                    n === (filters.page ?? 1)
                      ? 'bg-white/10 text-fg'
                      : 'border border-line text-muted hover:text-fg'
                  }`}
                >
                  {n}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
