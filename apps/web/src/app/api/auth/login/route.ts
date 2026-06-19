import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const upstream = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json({ message: data.message ?? 'Login failed' }, { status: upstream.status });
  }

  const res = NextResponse.json({ ok: true, role: roleFromJwt(data.accessToken) });
  setAuthCookies(res, data.accessToken, data.refreshToken);
  return res;
}

/** Decode the role claim from a JWT access token (no verification needed here — just routing). */
function roleFromJwt(token?: string): string | null {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json).role ?? null;
  } catch {
    return null;
  }
}
