import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { orders } from '@/lib/api';
import { OrderDetailView } from '@/components/account/OrderDetailView';

export const metadata: Metadata = { title: 'Order Details' };
export const dynamic = 'force-dynamic';

interface PageProps { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = await requireAuth();
  let order;
  try {
    order = await orders.get(token, id);
  } catch {
    notFound();
  }
  return <OrderDetailView order={order} />;
}
