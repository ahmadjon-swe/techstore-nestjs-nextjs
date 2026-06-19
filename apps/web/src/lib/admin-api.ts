const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function adminRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message ?? 'Request failed');
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export interface DashboardStats {
  todayOrders: number;
  totalRevenueUzs: string;
  lowStockVariants: number;
  pendingOrders: number;
}

export interface AdminOrder {
  id: string;
  number: string;
  status: string;
  totalUzs: string;
  createdAt: string;
  source: string;
  user: { id: string; name: string | null; email: string | null; phone: string | null };
  items: { id: string; titleSnap: string; priceUzs: string; quantity: number }[];
  payment: { provider: string; status: string } | null;
  address: {
    id: string; line1: string; line2: string | null;
    city: string; region: string | null; notes: string | null;
    lat: number | null; lng: number | null;
  } | null;
}

export interface LowStockVariant {
  id: string;
  sku: string;
  stock: number;
  product: { titleEn: string; slug: string };
}

export interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  locale: string;
  isGoogleLinked: boolean;
  addresses: Array<{
    id: string; label: string | null; line1: string; line2: string | null;
    city: string; region: string | null; notes: string | null; isDefault: boolean;
    lat: number | null; lng: number | null;
  }>;
  _count: { orders: number };
}

export const adminApi = {
  dashboard: (token: string): Promise<DashboardStats> =>
    adminRequest('/api/admin/dashboard', token),

  orders: (token: string): Promise<{ items: AdminOrder[]; total: number }> =>
    adminRequest('/api/admin/orders', token),

  lowStock: (token: string): Promise<LowStockVariant[]> =>
    adminRequest('/api/admin/low-stock', token),

  users: (token: string): Promise<{ items: AdminUser[]; total: number }> =>
    adminRequest('/api/admin/users', token),

  getUser: (token: string, id: string): Promise<AdminUserDetail> =>
    adminRequest(`/api/admin/users/${id}`, token),

  getUserOrders: (token: string, userId: string): Promise<{ items: AdminOrder[]; total: number }> =>
    adminRequest(`/api/admin/users/${userId}/orders`, token),

  updateOrderStatus: (token: string, orderId: string, status: string): Promise<void> =>
    adminRequest(`/api/orders/${orderId}/status`, token, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  createProduct: (token: string, data: object): Promise<{ id: string }> =>
    adminRequest('/api/inventory/products', token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (token: string, id: string, data: object): Promise<void> =>
    adminRequest(`/api/inventory/products/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  togglePublish: (token: string, id: string, publish: boolean): Promise<void> =>
    adminRequest(`/api/inventory/products/${id}/${publish ? 'publish' : 'unpublish'}`, token, {
      method: 'PATCH',
    }),

  listInventoryProducts: (token: string): Promise<{ items: any[]; total: number }> =>
    adminRequest('/api/inventory/products', token),

  getInventoryProduct: (token: string, id: string): Promise<any> =>
    adminRequest(`/api/inventory/products/${id}`, token),

  adjustStock: (token: string, variantId: string, delta: number): Promise<void> =>
    adminRequest(`/api/inventory/variants/${variantId}/stock`, token, {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    }),

  categories: (token: string): Promise<any[]> =>
    adminRequest('/api/catalog/categories', token),

  brands: (token: string): Promise<any[]> =>
    adminRequest('/api/catalog/brands', token),
};
