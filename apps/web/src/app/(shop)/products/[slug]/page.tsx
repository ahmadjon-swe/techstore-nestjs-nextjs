import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { catalog, ProductDetail, type ProductSummary } from '@/lib/api';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { ProductBreadcrumb, ProductReviews } from '@/components/product/ProductMeta';
import { ProductRail } from '@/components/product/ProductRail';

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

  const related: ProductSummary[] = await catalog.related(slug).catch(() => []);

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <ProductBreadcrumb title={product.titleEn} />

        <ProductDetailClient product={product} />

        <ProductReviews reviews={product.reviews} />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="border-t border-line">
          <ProductRail
            title="detail.related"
            eyebrowKey="detail.related.eyebrow"
            products={related.slice(0, 4)}
          />
        </div>
      )}
    </>
  );
}
