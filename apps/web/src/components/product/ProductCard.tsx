import Link from 'next/link';
import Image from 'next/image';
import { ProductSummary } from '@/lib/api';
import { ConditionBadge } from './ConditionBadge';
import { PriceDisplay } from './PriceDisplay';
import { QuickAdd } from './QuickAdd';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function resolveImg(url?: string) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const img = resolveImg(product.images[0]?.url);
  const variant = product.variants[0];
  const lowStock = variant && variant.stock > 0 && variant.stock <= 2;

  return (
    <article className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="border-glow block overflow-hidden rounded-2xl border border-line bg-surface/50 transition-all duration-500 hover:-translate-y-1 hover:border-line/0 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
      >
        <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_30%,var(--color-elevated),var(--color-bg-2))]">
          {img ? (
            <Image
              src={img}
              alt={product.images[0]?.alt ?? product.titleEn}
              fill
              className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-faint/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-14 w-14">
                <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.2" />
                <path d="m9 9 6 6M15 9l-6 6" strokeWidth="1.2" />
              </svg>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            <ConditionBadge condition={product.condition} grade={product.grade} />
            {lowStock && (
              <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                Only {variant.stock} left
              </span>
            )}
          </div>

          {/* sheen on hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent,rgba(255,255,255,0.06),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
        </div>

        <div className="space-y-2 p-4">
          {product.brand && (
            <span className="text-xs uppercase tracking-widest text-faint">{product.brand.name}</span>
          )}
          <h3 className="line-clamp-1 font-medium text-fg transition-colors group-hover:text-accent-ink">
            {product.titleEn}
          </h3>
          {variant && (
            <PriceDisplay priceUzs={variant.priceUzs} compareAtUzs={variant.compareAtUzs} />
          )}
        </div>
      </Link>

      {variant && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <QuickAdd variantId={variant.id} disabled={variant.stock === 0} />
        </div>
      )}
    </article>
  );
}
