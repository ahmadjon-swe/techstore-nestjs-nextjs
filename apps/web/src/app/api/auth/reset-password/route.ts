import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth';

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json({ message: data.message ?? 'Reset failed' }, { status: upstream.status });
  }
  // Reset returns fresh tokens — log the user straight in.
  const res = NextResponse.json({ ok: true });
  if (data.accessToken && data.refreshToken) setAuthCookies(res, data.accessToken, data.refreshToken);
  return res;
}
