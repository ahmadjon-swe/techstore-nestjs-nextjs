import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function getToken() {
  const store = await cookies();
  return store.get('access_token')?.value;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { variantId } = await params;
  const body = await req.json();
  const upstream = await fetch(`${API_URL}/api/cart/items/${variantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { variantId } = await params;
  await fetch(`${API_URL}/api/cart/items/${variantId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return new NextResponse(null, { status: 204 });
}
