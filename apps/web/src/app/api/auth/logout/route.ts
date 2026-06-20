import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';
import { cookies } from 'next/headers';

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(_req: NextRequest) {
  const store = await cookies();
  const token = store.get('access_token')?.value;

  if (token) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
