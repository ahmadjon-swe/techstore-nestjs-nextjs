import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Truck } from 'lucide-react';
import { catalog, CatalogFilters, CatalogResponse } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Hero } from '@/components/home/Hero';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'TechStore — The Future of Devices',
  description:
    'Flagship new and certified pre-owned smartphones, laptops and electronics in Tashkent.',
};

async function safeList(filter: CatalogFilters): Promise<CatalogResponse> {
  try {
    return await catalog.list(filter);
  } catch {
    return { total: 0, page: 1, limit: filter.limit ?? 20, items: [] };
  }
}

const VALUE_PROPS = [
  { icon: ShieldCheck, title: 'Honest grading', body: 'Every used device graded A–C with real condition notes. No surprises.' },
  { icon: Zap, title: 'Instant checkout', body: 'Pay with Payme, Click or cash. Secure, local, frictionless.' },
  { icon: Truck, title: 'Same-day Tashkent', body: 'Fast city-wide delivery, or pick up in-store today.' },
];

function Rail({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: CatalogResponse;
}) {
  if (products.items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <Reveal className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-accent-2">{eyebrow}</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
        </div>
        <Link
          href={href}
          className="group hidden items-center gap-1.5 text-sm text-muted hover:text-fg sm:flex"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
        {products.items.map((p) => (
          <RevealItem key={p.id}>
            <ProductCard product={p} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}

export default async function HomePage() {
  const [newProducts, usedProducts] = await Promise.all([
    safeList({ condition: 'NEW', limit: 4 }),
    safeList({ condition: 'USED', limit: 4 }),
  ]);

  return (
    <>
      <Hero />

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <RevealGroup className="grid gap-4 sm:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <RevealItem key={v.title}>
              <div className="border-glow flex h-full items-start gap-4 rounded-2xl border border-line bg-surface/40 p-6">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink">
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{v.body}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <Rail eyebrow="Just landed" title="New arrivals" href="/catalog?condition=NEW" products={newProducts} />
      <Rail eyebrow="Pre-owned, perfected" title="Certified used" href="/catalog?condition=USED" products={usedProducts} />

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="border-glow relative overflow-hidden rounded-3xl border border-line bg-[radial-gradient(120%_120%_at_0%_0%,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_60%)] px-8 py-16 text-center sm:py-24">
            <div className="aurora opacity-30" aria-hidden />
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Find your next device.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Browse the full catalog — filter by condition, brand and budget.
            </p>
            <Link
              href="/catalog"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] px-8 text-sm font-medium text-white shadow-[0_10px_40px_-10px_var(--color-accent)] transition-transform hover:-translate-y-0.5"
            >
              Explore catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
