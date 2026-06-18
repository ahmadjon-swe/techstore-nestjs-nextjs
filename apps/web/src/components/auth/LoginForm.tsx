'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

// Dev-only one-click logins. Must match packages/db/prisma/seed-demo.ts.
const DEMO_ACCOUNTS = [
  { label: 'Owner', email: 'owner@demo.uz', password: 'Demo1234!', desc: 'Full admin', color: 'from-[#6e8bff] to-[#34e3e8]' },
  { label: 'Manager', email: 'manager@demo.uz', password: 'Demo1234!', desc: 'Manage store', color: 'from-[#a06bff] to-[#6e8bff]' },
  { label: 'Staff', email: 'staff@demo.uz', password: 'Demo1234!', desc: 'Limited admin', color: 'from-[#34e3e8] to-[#3fd6a0]' },
  { label: 'Customer', email: 'customer@demo.uz', password: 'Demo1234!', desc: 'Shop & order', color: 'from-[#e0a24a] to-[#ff6b6b]' },
] as const;

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOpen, setDevOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? 'Login failed');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="submit" loading={loading} className="w-full">
          Sign in
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
              'grid transition-[grid-template-rows] duration-300',
              devOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="overflow-hidden">
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
