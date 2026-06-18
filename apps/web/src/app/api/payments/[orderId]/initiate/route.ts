import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const store = await cookies();
  const token = store.get('access_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { orderId } = await params;
  const upstream = await fetch(`${API_URL}/api/payments/orders/${orderId}/initiate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
