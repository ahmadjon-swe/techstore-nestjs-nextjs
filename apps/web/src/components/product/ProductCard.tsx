'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { ProductSummary } from '@/lib/api';
import { useT, localized } from '@/lib/i18n';
import { resolveImg, primaryVariant, discountPercent, isNewArrival } from '@/lib/product';
import { ConditionBadge } from './ConditionBadge';
import { PriceDisplay } from './PriceDisplay';
import { QuickAdd } from './QuickAdd';
import { WishlistButton } from './WishlistButton';

export function ProductCard({ product }: { product: ProductSummary }) {
  const { t, locale } = useT();
  const title = localized(product, 'title', locale) || product.titleEn;
  const img = resolveImg(product.images[0]?.url);
  const hoverImg = resolveImg(product.images[1]?.url);
  const variant = primaryVariant(product);
  const discount = discountPercent(product);
  const isNew = isNewArrival(product);

  return (
    <article className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="border-glow block overflow-hidden rounded-2xl border border-line bg-surface/50 transition-all duration-500 hover:-translate-y-1 hover:border-line/0 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,#000_calc(var(--shadow-strength)*100%),transparent)]"
      >
        <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_30%,var(--color-elevated),var(--color-bg-2))]">
          {img ? (
            <>
              <Image
                src={img}
                alt={product.images[0]?.alt ?? title}
                fill
                className={`object-contain p-6 transition-all duration-700 ease-out group-hover:scale-110 ${
                  hoverImg ? 'group-hover:opacity-0' : ''
                }`}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              />
              {hoverImg && (
                <Image
                  src={hoverImg}
                  alt={product.images[1]?.alt ?? title}
                  fill
                  className="object-contain p-6 opacity-0 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center text-faint/40">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-14 w-14">
                <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.2" />
                <path d="m9 9 6 6M15 9l-6 6" strokeWidth="1.2" />
              </svg>
            </div>
          )}

          {/* badges */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-[linear-gradient(110deg,var(--color-danger),#ff8f6b)] px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                −{discount}%
              </span>
            )}
            {isNew && product.condition === 'NEW' && (
              <span className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                <Sparkles className="h-3 w-3" />
                {t('card.new')}
              </span>
            )}
            {product.condition === 'USED' && (
              <ConditionBadge condition={product.condition} grade={product.grade} />
            )}
          </div>

          {/* wishlist */}
          <div className="absolute right-3 top-3 z-10">
            <WishlistButton productId={product.id} size="sm" />
          </div>

          {/* sheen on hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent,var(--sheen),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
        </div>

        <div className="space-y-2 p-4">
          {product.brand && (
            <span className="text-xs uppercase tracking-widest text-faint">{product.brand.name}</span>
          )}
          <h3 className="line-clamp-1 font-medium text-fg transition-colors group-hover:text-accent-ink">
            {title}
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
