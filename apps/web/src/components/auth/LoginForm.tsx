'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

const ADMIN_ROLES = ['OWNER', 'MANAGER', 'STAFF'];

// Dev-only one-click logins. Must match packages/db/prisma/seed-demo.ts.
const DEMO_ACCOUNTS = [
  { label: 'Owner', email: 'owner@demo.uz', password: 'Demo1234!', desc: 'Full admin', color: 'from-[#6e8bff] to-[#34e3e8]' },
  { label: 'Manager', email: 'manager@demo.uz', password: 'Demo1234!', desc: 'Manage store', color: 'from-[#a06bff] to-[#6e8bff]' },
  { label: 'Staff', email: 'staff@demo.uz', password: 'Demo1234!', desc: 'Limited admin', color: 'from-[#34e3e8] to-[#3fd6a0]' },
  { label: 'Customer', email: 'customer@demo.uz', password: 'Demo1234!', desc: 'Shop & order', color: 'from-[#e0a24a] to-[#ff6b6b]' },
] as const;

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function LoginForm() {
  const router = useRouter();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Login failed');
        return;
      }
      // Staff/managers/owners land in the admin console; customers go shopping.
      const dest = ADMIN_ROLES.includes(data.role) ? '/admin' : '/';
      router.push(dest);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void doLogin(email, password);
  }

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <a
        href={`${API_URL}/api/auth/google`}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:border-faint hover:bg-bg-2"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {t('auth.continueGoogle')}
      </a>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-faint">{t('auth.or')}</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.email')}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <Input
            label={t('auth.password')}
            type="password"
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-1.5 text-right">
            <Link href="/auth/forgot-password" className="text-xs text-muted hover:text-accent-ink">
              {t('auth.forgot')}
            </Link>
          </div>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          {t('auth.signin')}
        </Button>
      </form>

      {IS_DEV && (
        <div className="rounded-xl border border-line bg-bg-2/40 p-3">
          <button
            type="button"
            onClick={() => setDevOpen((v) => !v)}
            aria-expanded={devOpen}
            className="flex w-full items-center justify-between text-xs font-medium text-muted hover:text-fg"
          >
            <span className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-accent-2" />
              Dev mode — demo accounts
            </span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', devOpen && 'rotate-180')} />
          </button>

          <div
            className={cn(
              'overflow-hidden transition-[max-height] duration-300 ease-in-out',
              devOpen ? 'max-h-96' : 'max-h-0',
            )}
          >
            <div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    tabIndex={devOpen ? 0 : -1}
                    onClick={() => {
                      setEmail(a.email);
                      setPassword(a.password);
                      setDevOpen(false);
                      void doLogin(a.email, a.password);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-line bg-surface/60 p-2 text-left transition-colors hover:border-faint"
                  >
                    <span
                      className={cn(
                        'grid h-7 w-7 shrink-0 place-items-center rounded-md bg-linear-to-br text-[10px] font-bold text-white',
                        a.color,
                      )}
                    >
                      {a.label[0]}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-fg">{a.label}</span>
                      <span className="block truncate text-[10px] text-faint">{a.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-faint">
                Run <code className="font-mono text-accent-2">pnpm db:seed:demo</code> to create these.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
