import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  // req.url reflects the internal Docker address (0.0.0.0:3000), not the public
  // domain. Reconstruct the origin from forwarded headers set by nginx.
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host;
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const base = `${proto}://${host}`;

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', base));
  }

  const res = NextResponse.redirect(new URL('/', base));
  setAuthCookies(res as unknown as Response, accessToken, refreshToken);
  return res;
}
