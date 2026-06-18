import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies, clearAuthCookies } from '@/lib/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(_req: NextRequest) {
  const store = await cookies();
  const refreshToken = store.get('refresh_token')?.value;

  if (!refreshToken) {
    const res = NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const upstream = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!upstream.ok) {
    const res = NextResponse.json({ message: 'Session expired' }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const data = await upstream.json();
  const res = NextResponse.json({ ok: true });
  setAuthCookies(res, data.accessToken, data.refreshToken);
  return res;
}
