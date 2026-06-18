export function formatPrice(uzs: string): string {
  const n = parseInt(uzs, 10);
  return new Intl.NumberFormat('uz-UZ').format(n) + ' so\'m';
}
