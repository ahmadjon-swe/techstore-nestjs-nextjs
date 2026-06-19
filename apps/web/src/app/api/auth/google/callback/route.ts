import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth_failed', req.url));
  }

  const res = NextResponse.redirect(new URL('/', req.url));
  setAuthCookies(res as unknown as Response, accessToken, refreshToken);
  return res;
}
