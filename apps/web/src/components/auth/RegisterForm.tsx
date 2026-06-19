'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n';

export function RegisterForm() {
  const router = useRouter();
  const { t } = useT();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || undefined,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Failed');
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('auth.name')}
        name="name"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
      />
      <Input
        label={t('auth.email')}
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => set('email', e.target.value)}
      />
      <Input
        label={`${t('auth.phone')} (+998…)`}
        name="phone"
        autoComplete="tel"
        placeholder="+998901234567"
        value={form.phone}
        onChange={(e) => set('phone', e.target.value)}
      />
      <Input
        label={t('auth.password')}
        type="password"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Min. 8 characters"
        value={form.password}
        onChange={(e) => set('password', e.target.value)}
      />
      <Input
        label={t('auth.confirmPassword')}
        type="password"
        name="confirmPassword"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={(e) => set('confirmPassword', e.target.value)}
        error={form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? t('auth.passwordMismatch') : undefined}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        {t('auth.signup')}
      </Button>
    </form>
  );
}
