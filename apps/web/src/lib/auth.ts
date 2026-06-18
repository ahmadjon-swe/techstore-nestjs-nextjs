import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserProfile } from './api';

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get('access_token')?.value;
}

export async function requireAuth(): Promise<string> {
  const token = await getAccessToken();
  if (!token) redirect('/auth/login');
  return token;
}

export async function getSession(): Promise<{ token: string; user?: UserProfile } | null> {
  const token = await getAccessToken();
  if (!token) return null;
  return { token };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.headers.append(
    'Set-Cookie',
    `access_token=${accessToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=900${secure}`,
  );
  res.headers.append(
    'Set-Cookie',
    `refresh_token=${refreshToken}; HttpOnly; Path=/api/auth/refresh; SameSite=Lax; Max-Age=2592000${secure}`,
  );
}

export function clearAuthCookies(res: Response): void {
  res.headers.append('Set-Cookie', 'access_token=; HttpOnly; Path=/; Max-Age=0');
  res.headers.append('Set-Cookie', 'refresh_token=; HttpOnly; Path=/api/auth/refresh; Max-Age=0');
}
