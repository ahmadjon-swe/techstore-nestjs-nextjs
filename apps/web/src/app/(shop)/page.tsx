import type { Metadata } from 'next';
import { catalog, type ProductSummary, type HomeSection } from '@/lib/api';
import { ProductRail } from '@/components/product/ProductRail';
import { Hero } from '@/components/home/Hero';
import { ValueProps, HomeCTA } from '@/components/home/ValueProps';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'TechStore — The Future of Devices',
  description:
    'Flagship new and certified pre-owned smartphones, laptops and electronics in Tashkent.',
};

export default async function HomePage() {
  const [newArrivals, discounted, sections] = await Promise.all([
    catalog.newArrivals(8).catch(() => [] as ProductSummary[]),
    catalog.discounted(8).catch(() => [] as ProductSummary[]),
    catalog.homeSections().catch(() => [] as HomeSection[]),
  ]);

  return (
    <>
      <Hero />

      <ValueProps />

      {/* New arrivals */}
      <ProductRail
        title="home.newArrivals"
        eyebrowKey="card.new"
        href="/catalog?sort=newest"
        products={newArrivals}
      />

      {/* Deals — only renders if something is on sale */}
      <ProductRail
        title="home.deals"
        eyebrowKey="catalog.onSale"
        href="/catalog?onSale=true"
        products={discounted}
      />

      {/* Category sections */}
      {sections.map((s) => (
        <ProductRail
          key={s.category.id}
          title={{ category: s.category }}
          eyebrowKey="nav.all"
          href={`/catalog?category=${s.category.slug}`}
          products={s.products}
        />
      ))}

      <HomeCTA />
    </>
  );
}
