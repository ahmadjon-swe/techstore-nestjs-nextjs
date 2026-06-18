import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { adminApi } from '@/lib/admin-api';
import { formatPrice } from '@/lib/utils';
import { ConditionBadge } from '@/components/product/ConditionBadge';
import { AdminPublishToggle } from '@/components/admin/AdminPublishToggle';

export const metadata: Metadata = { title: 'Products — Admin' };

export default async function AdminProductsPage() {
  const token = await requireAuth();
  const { items } = await adminApi.listInventoryProducts(token);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-fg">Products</h1>
        <Link href="/admin/products/new" className="bg-elevated text-fg px-4 py-2 rounded text-sm hover:bg-elevated transition-colors">
          + New product
        </Link>
      </div>

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg-2">
              {['Product', 'Condition', 'Variants', 'Min price', 'Stock', 'Published', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p: any) => {
              const minPrice = p.variants.reduce((m: string, v: any) =>
                !m || BigInt(v.priceUzs) < BigInt(m) ? v.priceUzs : m, '');
              const totalStock = p.variants.reduce((s: number, v: any) => s + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-bg-2/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg">{p.titleEn}</p>
                    <p className="text-xs text-muted">{p.brand?.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ConditionBadge condition={p.condition} grade={p.grade} />
                  </td>
                  <td className="px-4 py-3 text-muted">{p.variants.length}</td>
                  <td className="px-4 py-3 tabular-nums">{minPrice ? formatPrice(minPrice) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={totalStock === 0 ? 'text-danger' : totalStock <= 2 ? 'text-amber-600' : 'text-success'}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminPublishToggle productId={p.id} published={p.isPublished} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="text-accent text-xs hover:underline">Edit</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-muted py-12">No products yet.</p>}
      </div>
    </div>
  );
}
