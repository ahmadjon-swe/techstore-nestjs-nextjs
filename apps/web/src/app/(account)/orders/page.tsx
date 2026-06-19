import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { orders } from '@/lib/api';
import { OrdersList } from '@/components/account/OrdersList';

export const metadata: Metadata = { title: 'My Orders' };
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const token = await requireAuth();
  const data = await orders.list(token).catch(() => ({ items: [], total: 0 }));
  return <OrdersList items={data.items as any} />;
}
