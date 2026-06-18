import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { ProductForm } from '@/components/admin/ProductForm';
import { StockEditor } from '@/components/admin/StockEditor';

export const metadata: Metadata = { title: 'Edit Product — Admin' };

interface PageProps { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireAuth();
  const [product, categories, brands] = await Promise.all([
    adminApi.getInventoryProduct(token, id).catch(() => null),
    adminApi.categories(token),
    adminApi.brands(token),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="font-display text-3xl text-fg">Edit Product</h1>
      <ProductForm product={product} categories={categories} brands={brands} />

      {product.variants.length > 0 && (
        <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
          <h2 className="font-medium text-sm uppercase tracking-wide text-muted">Stock</h2>
          {product.variants.map((v: any) => (
            <StockEditor key={v.id} variantId={v.id} sku={v.sku} currentStock={v.stock} />
          ))}
        </div>
      )}
    </div>
  );
}
