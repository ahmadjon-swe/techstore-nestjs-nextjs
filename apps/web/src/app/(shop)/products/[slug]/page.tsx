import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { catalog, ProductDetail } from '@/lib/api';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { Reveal } from '@/components/motion/Reveal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await catalog.get(slug);
    const img = product.images[0]?.url;
    return {
      title: product.titleEn,
      description: product.descriptionEn ?? `Buy ${product.titleEn} at TechStore`,
      openGraph: {
        title: product.titleEn,
        images: img ? [{ url: img.startsWith('http') ? img : `${API_URL}${img}` }] : [],
      },
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export const revalidate = 60;

function productJsonLd(product: ProductDetail) {
  const variant = product.variants[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.titleEn,
    description: product.descriptionEn,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    image: product.images.map((i) => (i.url.startsWith('http') ? i.url : `${API_URL}${i.url}`)),
    offers: variant
      ? {
          '@type': 'Offer',
          priceCurrency: 'UZS',
          price: variant.priceUzs,
          availability:
            variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition:
            product.condition === 'NEW'
              ? 'https://schema.org/NewCondition'
              : 'https://schema.org/UsedCondition',
        }
      : undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  let product: ProductDetail;
  try {
    product = await catalog.get(slug);
  } catch {
    notFound();
  }

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-faint">
          <Link href="/" className="hover:text-fg">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/catalog" className="hover:text-fg">Catalog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-muted">{product.titleEn}</span>
        </nav>

        <ProductDetailClient product={product} />

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <Reveal as="section" className="mt-20 border-t border-line pt-12">
            <div className="mb-8 flex items-baseline gap-3">
              <h2 className="font-display text-2xl tracking-tight">Reviews</h2>
              {avg != null && (
                <span className="flex items-center gap-1 text-sm text-muted">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <strong className="text-fg">{avg.toFixed(1)}</strong> · {product.reviews.length}
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-line bg-surface/40 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{r.user?.name ?? 'Anonymous'}</span>
                    <span className="text-xs text-faint">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-2 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-warning text-warning' : 'fill-line text-line'}`}
                      />
                    ))}
                  </div>
                  {r.body && <p className="text-sm leading-relaxed text-muted">{r.body}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </>
  );
}
