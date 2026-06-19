const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(res.status, body.message ?? 'Request failed');
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ── Catalog ────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  storage: string | null;
  color: string | null;
  priceUzs: string;
  compareAtUzs: string | null;
  stock: number;
  attributes: Record<string, unknown> | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  condition: 'NEW' | 'USED';
  grade: 'A' | 'B' | 'C' | null;
  isPublished: boolean;
  createdAt: string;
  category: { slug: string; nameUz: string; nameRu: string; nameEn: string };
  brand: { slug: string; name: string; logoUrl: string | null } | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductDetail extends ProductSummary {
  descriptionUz: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  conditionNotes: string | null;
  batteryHealth: number | null;
  releaseYear: number | null;
  modelName: string | null;
  mpn: string | null;
  warrantyMonths: number | null;
  weightGrams: number | null;
  highlights: string[];
  /** Grouped spec sheet: { "Display": { "Size": "6.7\"", ... }, ... } */
  specs: Record<string, Record<string, string>> | null;
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  body: string | null;
  createdAt: string;
  user: { id: string; name: string | null } | null;
}

export interface CatalogResponse {
  total: number;
  page: number;
  limit: number;
  items: ProductSummary[];
}

export interface Category {
  id: string;
  slug: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  children?: Category[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'discount';

export type CatalogFilters = {
  categorySlug?: string;
  brandSlug?: string;
  condition?: 'NEW' | 'USED';
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: ProductSort;
  onSale?: boolean;
  page?: number;
  limit?: number;
};

export interface HomeSection {
  category: { id: string; slug: string; nameUz: string; nameRu: string; nameEn: string };
  products: ProductSummary[];
}

export function buildCatalogUrl(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.categorySlug) params.set('categorySlug', filters.categorySlug);
  if (filters.brandSlug) params.set('brandSlug', filters.brandSlug);
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.onSale) params.set('onSale', 'true');
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const q = params.toString();
  return `/api/catalog/products${q ? `?${q}` : ''}`;
}

export const catalog = {
  list: (filters: CatalogFilters = {}): Promise<CatalogResponse> =>
    request<CatalogResponse>(buildCatalogUrl(filters), { next: { revalidate: 60 } }),
  get: (slug: string): Promise<ProductDetail> =>
    request<ProductDetail>(`/api/catalog/products/${slug}`, { next: { revalidate: 60 } }),
  related: (slug: string): Promise<ProductSummary[]> =>
    request<ProductSummary[]>(`/api/catalog/products/${slug}/related`, { next: { revalidate: 120 } }),
  discounted: (limit = 12): Promise<ProductSummary[]> =>
    request<ProductSummary[]>(`/api/catalog/discounted?limit=${limit}`, { next: { revalidate: 60 } }),
  newArrivals: (limit = 12): Promise<ProductSummary[]> =>
    request<ProductSummary[]>(`/api/catalog/new-arrivals?limit=${limit}`, { next: { revalidate: 60 } }),
  homeSections: (): Promise<HomeSection[]> =>
    request<HomeSection[]>('/api/catalog/home-sections', { next: { revalidate: 60 } }),
  categories: (): Promise<Category[]> =>
    request<Category[]>('/api/catalog/categories', { next: { revalidate: 300 } }),
  navCategories: (): Promise<Category[]> =>
    request<Category[]>('/api/catalog/nav-categories', { next: { revalidate: 120 } }),
  brands: (): Promise<Brand[]> =>
    request<Brand[]>('/api/catalog/brands', { next: { revalidate: 300 } }),
};

// ── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistEntry extends ProductSummary {
  wishlistId: string;
  savedAt: string;
}

export const wishlist = {
  list: (token: string): Promise<WishlistEntry[]> =>
    request<WishlistEntry[]>('/api/wishlist', { cache: 'no-store' }, token),
  ids: (token: string): Promise<string[]> =>
    request<string[]>('/api/wishlist/ids', { cache: 'no-store' }, token),
  toggle: (token: string, productId: string): Promise<{ saved: boolean }> =>
    request<{ saved: boolean }>(`/api/wishlist/${productId}/toggle`, { method: 'POST' }, token),
};

// ── Cart ───────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & { product: { titleEn: string; slug: string; images: ProductImage[] } };
}

export interface Cart {
  id: string;
  total: string;
  items: CartItem[];
}

export const cart = {
  get: (token: string): Promise<Cart> =>
    request<Cart>('/api/cart', {}, token),
  add: (token: string, variantId: string, quantity = 1): Promise<Cart> =>
    request<Cart>('/api/cart/items', { method: 'POST', body: JSON.stringify({ variantId, quantity }) }, token),
  update: (token: string, variantId: string, quantity: number): Promise<Cart> =>
    request<Cart>(`/api/cart/items/${variantId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }, token),
  remove: (token: string, variantId: string): Promise<void> =>
    request<void>(`/api/cart/items/${variantId}`, { method: 'DELETE' }, token),
};

// ── Orders ─────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  number: string;
  status: string;
  totalUzs: string;
  address: { city: string; line1: string; line2?: string; region?: string } | null;
  createdAt: string;
  items: { id: string; titleSnap: string; priceUzs: string; quantity: number }[];
  payment: { provider: string; status: string } | null;
}

// Alias used by list pages that only need summary fields
export type OrderSummary = Order;

export const orders = {
  list: (token: string): Promise<{ items: Order[]; total: number }> =>
    request('/api/orders', { cache: 'no-store' }, token),
  get: (token: string, id: string): Promise<Order> =>
    request(`/api/orders/${id}`, { cache: 'no-store' }, token),
  create: (token: string, body: { addressId?: string; address?: object; paymentProvider: string }): Promise<Order> =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(body) }, token),
  cancel: (token: string, id: string): Promise<Order> =>
    request(`/api/orders/${id}/cancel`, { method: 'POST' }, token),
};

// ── Payments ───────────────────────────────────────────────────────────────

export const payments = {
  initiate: (token: string, orderId: string): Promise<{ checkoutUrl?: string; message?: string }> =>
    request(`/api/payments/orders/${orderId}/initiate`, { method: 'POST' }, token),
};

// ── Users ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  locale: string;
  hasPassword?: boolean;
  isGoogleLinked?: boolean;
}

export interface Address {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  notes: string | null;
  isDefault: boolean;
  lat: number | null;
  lng: number | null;
}

export const users = {
  profile: (token: string): Promise<UserProfile> =>
    request('/api/users/me', { cache: 'no-store' }, token),
  updateProfile: (token: string, data: Partial<UserProfile>): Promise<UserProfile> =>
    request('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }, token),
  deleteAccount: (token: string): Promise<{ success: boolean }> =>
    request('/api/users/me', { method: 'DELETE' }, token),
  addresses: (token: string): Promise<Address[]> =>
    request('/api/users/me/addresses', {}, token),
  createAddress: (token: string, data: object): Promise<Address> =>
    request('/api/users/me/addresses', { method: 'POST', body: JSON.stringify(data) }, token),
  deleteAddress: (token: string, id: string): Promise<void> =>
    request(`/api/users/me/addresses/${id}`, { method: 'DELETE' }, token),
};
