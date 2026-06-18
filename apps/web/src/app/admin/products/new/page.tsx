import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = { title: 'New Product — Admin' };

export default async function NewProductPage() {
  const token = await requireAuth();
  const [categories, brands] = await Promise.all([
    adminApi.categories(token),
    adminApi.brands(token),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-3xl text-fg">New Product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
