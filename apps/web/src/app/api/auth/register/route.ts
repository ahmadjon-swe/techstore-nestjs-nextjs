import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth';

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json({ message: data.message ?? 'Registration failed' }, { status: upstream.status });
  }

  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, data.accessToken, data.refreshToken);
  return res;
}
