import type { Metadata } from 'next';
import Link from 'next/link';
import { catalog, CatalogFilters, ProductSort } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { CatalogToolbar } from '@/components/catalog/CatalogToolbar';
import { CatalogHeading } from '@/components/catalog/CatalogHeading';
import { CatalogEmpty } from '@/components/catalog/CatalogEmpty';

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse new and certified used devices — smartphones, laptops and more.',
};

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters: CatalogFilters = {
    condition: params.condition as 'NEW' | 'USED' | undefined,
    categorySlug: params.category,
    brandSlug: params.brand,
    search: params.search,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    onSale: params.onSale === 'true',
    sort: (params.sort as ProductSort) || undefined,
    page: params.page ? Number(params.page) : 1,
    limit: 24,
  };

  const [products, categories, brands] = await Promise.all([
    catalog.list(filters).catch(() => ({ total: 0, page: 1, limit: 24, items: [] })),
    catalog.navCategories().catch(() => []),
    catalog.brands().catch(() => []),
  ]);

  const totalPages = Math.ceil(products.total / 24);

  function buildPageUrl(page: number) {
    const p = new URLSearchParams(params as Record<string, string>);
    if (page <= 1) p.delete('page');
    else p.set('page', String(page));
    const qs = p.toString();
    return `/catalog${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 border-b border-line pb-8">
        <CatalogHeading total={products.total} search={params.search} />
      </div>

      {/* Toolbar: search · sort · filter */}
      <div className="mb-8">
        <CatalogToolbar
          params={params}
          categories={categories.map((c) => ({ slug: c.slug, nameUz: c.nameUz, nameRu: c.nameRu, nameEn: c.nameEn }))}
          brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
        />
      </div>

      {/* Grid */}
      {products.items.length === 0 ? (
        <CatalogEmpty />
      ) : (
        <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5" stagger={0.05}>
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
              href={buildPageUrl(n)}
              className={`grid h-10 w-10 place-items-center rounded-full text-sm transition-colors ${
                n === (filters.page ?? 1)
                  ? 'bg-fg/10 text-fg'
                  : 'border border-line text-muted hover:text-fg'
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
