export type Locale = 'uz' | 'ru' | 'en';

export function formatPrice(uzs: string | number | bigint): string {
  const n = typeof uzs === 'string' ? parseInt(uzs, 10) : Number(uzs);
  return new Intl.NumberFormat('uz-UZ', { style: 'decimal' }).format(n) + ' so\'m';
}

export function pickLocale<T extends { titleUz: string; titleRu: string; titleEn: string }>(
  obj: T,
  locale: Locale = 'en',
): string {
  if (locale === 'uz') return obj.titleUz;
  if (locale === 'ru') return obj.titleRu;
  return obj.titleEn;
}

export function pickCategoryName(
  cat: { nameUz: string; nameRu: string; nameEn: string },
  locale: Locale = 'en',
): string {
  if (locale === 'uz') return cat.nameUz;
  if (locale === 'ru') return cat.nameRu;
  return cat.nameEn;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  PAYME: 'Payme',
  CLICK: 'Click',
  CASH: 'Cash on delivery',
};
