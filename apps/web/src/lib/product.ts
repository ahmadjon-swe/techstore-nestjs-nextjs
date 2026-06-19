import type { ProductSummary, ProductVariant } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function resolveImg(url?: string): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${API_URL}${url}`;
}

/** Cheapest variant of a product (the one we price the card from). */
export function primaryVariant(p: ProductSummary): ProductVariant | undefined {
  if (!p.variants.length) return undefined;
  return p.variants.reduce((min, v) => (parseInt(v.priceUzs) < parseInt(min.priceUzs) ? v : min), p.variants[0]);
}

/** Best discount percentage across variants (0 = not on sale). */
export function discountPercent(p: ProductSummary): number {
  let best = 0;
  for (const v of p.variants) {
    if (v.compareAtUzs && parseInt(v.compareAtUzs) > parseInt(v.priceUzs)) {
      const pct = Math.round(((parseInt(v.compareAtUzs) - parseInt(v.priceUzs)) / parseInt(v.compareAtUzs)) * 100);
      if (pct > best) best = pct;
    }
  }
  return best;
}

/** "New" = published within the last N days. */
export function isNewArrival(p: ProductSummary, days = 21): boolean {
  const created = new Date(p.createdAt).getTime();
  return Date.now() - created < days * 86_400_000;
}
