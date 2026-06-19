'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import { ShoppingBag, Check, ShieldCheck, BatteryCharging, Truck } from 'lucide-react';
import type { ProductDetail } from '@/lib/api';
import { ConditionBadge } from './ConditionBadge';
import { PriceDisplay } from './PriceDisplay';
import { WishlistButton } from './WishlistButton';
import { useCartUI } from '@/store/cart';
import { useT, localized } from '@/lib/i18n';
import { cn } from '@/lib/cn';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const resolve = (u?: string) => (u ? (u.startsWith('http') ? u : `${API_URL}${u}`) : null);

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const images = product.images.length ? product.images : [];
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const bump = useCartUI((s) => s.bump);
  const open = useCartUI((s) => s.open);
  const router = useRouter();
  const { t, locale } = useT();

  const title = localized(product, 'title', locale) || product.titleEn;
  const description = localized(product, 'description', locale) || product.descriptionEn;
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const mainSrc = resolve(images[activeImg]?.url);

  async function addToCart() {
    if (!variant || variant.stock === 0 || loading) return;
    setLoading(true);
    bump(1);
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: variant.id, quantity: 1 }),
      });
      if (res.status === 401) {
        bump(-1);
        toast.error(t('detail.signInToAdd'));
        router.push('/auth/login');
        return;
      }
      if (!res.ok) {
        bump(-1);
        toast.error(t('common.error'));
        return;
      }
      setAdded(true);
      toast.success(t('detail.addedToCart'));
      open();
      setTimeout(() => setAdded(false), 1600);
    } catch {
      bump(-1);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      {/* Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <m.div
          key={activeImg}
          initial={{ opacity: 0.4, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="border-glow group relative aspect-square overflow-hidden rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_30%,var(--color-elevated),var(--color-bg-2))]"
        >
          {mainSrc ? (
            <Image
              src={mainSrc}
              alt={product.titleEn}
              fill
              priority
              className="object-contain p-10 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          ) : (
            <div className="grid h-full place-items-center text-faint/30">
              <ShoppingBag className="h-20 w-20" />
            </div>
          )}
          <div className="absolute left-4 top-4">
            <ConditionBadge condition={product.condition} grade={product.grade} />
          </div>
        </m.div>

        {images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {images.slice(0, 6).map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className={cn(
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-elevated transition-all',
                  i === activeImg ? 'border-accent ring-2 ring-accent/30' : 'border-line hover:border-faint',
                )}
              >
                <Image src={resolve(img.url)!} alt="" fill className="object-contain p-1.5" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Buy box */}
      <div className="lg:py-4">
        {product.brand && (
          <span className="text-xs uppercase tracking-widest text-accent-2">{product.brand.name}</span>
        )}
        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <WishlistButton productId={product.id} className="mt-1 shrink-0" />
        </div>

        {variant && (
          <div className="mt-5">
            <PriceDisplay priceUzs={variant.priceUzs} compareAtUzs={variant.compareAtUzs} size="lg" />
          </div>
        )}

        {/* Variant selector */}
        {product.variants.length > 1 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-faint">
              {t('detail.configuration')}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const label = [v.storage, v.color].filter(Boolean).join(' · ') || v.sku;
                const active = v.id === variantId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.stock === 0}
                    className={cn(
                      'rounded-xl border px-4 py-2.5 text-sm transition-all disabled:opacity-40',
                      active
                        ? 'border-accent bg-accent/10 text-fg ring-1 ring-accent/30'
                        : 'border-line text-muted hover:border-faint hover:text-fg',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Used condition panel */}
        {product.condition === 'USED' && (product.conditionNotes || product.batteryHealth) && (
          <div className="mt-6 rounded-2xl border border-used/25 bg-used/5 p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-used">
              <ShieldCheck className="h-4 w-4" /> {t('detail.condition.report')}
            </p>
            {product.batteryHealth != null && (
              <p className="flex items-center gap-2 text-sm text-fg">
                <BatteryCharging className="h-4 w-4 text-used" /> {t('detail.battery')}:{' '}
                <strong>{product.batteryHealth}%</strong>
              </p>
            )}
            {product.conditionNotes && (
              <p className="mt-1 text-sm leading-relaxed text-muted">{product.conditionNotes}</p>
            )}
          </div>
        )}

        {/* Stock + CTA */}
        <div className="mt-7 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                variant && variant.stock > 0 ? 'bg-success shadow-[0_0_8px] shadow-success' : 'bg-danger',
              )}
            />
            <span className={variant && variant.stock > 0 ? 'text-success' : 'text-danger'}>
              {variant && variant.stock > 0 ? t('detail.inStock', { n: variant.stock }) : t('detail.outOfStock')}
            </span>
          </div>

          <button
            onClick={addToCart}
            disabled={!variant || variant.stock === 0 || loading}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] py-4 text-sm font-medium text-white shadow-[0_12px_44px_-12px_var(--color-accent)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
            {variant && variant.stock === 0 ? t('card.soldOut') : added ? t('card.added') : t('card.addToCart')}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-faint">
            <Truck className="h-3.5 w-3.5" /> {t('detail.delivery')}
          </div>
        </div>

        {/* Key facts strip */}
        {(product.releaseYear || product.modelName || product.warrantyMonths || product.weightGrams) && (
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {[
              product.releaseYear && { label: t('detail.fact.year'), value: String(product.releaseYear) },
              product.modelName && { label: t('detail.fact.model'), value: product.modelName },
              product.warrantyMonths && { label: t('detail.fact.warranty'), value: t('detail.fact.months', { n: product.warrantyMonths }) },
              product.weightGrams && { label: t('detail.fact.weight'), value: t('detail.fact.grams', { n: product.weightGrams }) },
            ]
              .filter(Boolean)
              .map((f) => {
                const fact = f as { label: string; value: string };
                return (
                  <div key={fact.label} className="bg-surface px-4 py-3">
                    <dt className="text-[11px] uppercase tracking-wide text-faint">{fact.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-fg">{fact.value}</dd>
                  </div>
                );
              })}
          </dl>
        )}

        {description && (
          <div className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-muted">
            {description}
          </div>
        )}

        {/* Highlights */}
        {product.highlights?.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">{t('detail.highlights')}</h2>
            <ul className="space-y-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Spec sheet */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">{t('detail.specs')}</h2>
            <div className="overflow-hidden rounded-2xl border border-line">
              {Object.entries(product.specs).map(([group, rows]) => (
                <div key={group} className="border-b border-line last:border-b-0">
                  <p className="bg-elevated px-4 py-2 text-xs font-medium uppercase tracking-wide text-accent-2">
                    {group}
                  </p>
                  <dl className="divide-y divide-line">
                    {Object.entries(rows).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                        <dt className="text-muted">{k}</dt>
                        <dd className="text-right font-medium text-fg">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
