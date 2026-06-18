'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        label="Name"
        name="name"
        placeholder="Your name"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => set('email', e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        name="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="Min. 8 characters"
        value={form.password}
        onChange={(e) => set('password', e.target.value)}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>
    </form>
  );
}
