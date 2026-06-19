'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import type { UserProfile } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n';

export function AccountSecurity({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const { t } = useT();
  const hasPassword = profile.hasPassword !== false;

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? t('common.error'));
        return;
      }
      toast.success(t('profile.saved'));
      setCurrent('');
      setNext('');
    } finally {
      setPwLoading(false);
    }
  }

  async function deleteAccount() {
    if (!confirm(t('profile.deleteConfirm'))) return;
    setDelLoading(true);
    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? t('common.error'));
        return;
      }
      toast.success('Account deleted');
      router.push('/');
      router.refresh();
    } finally {
      setDelLoading(false);
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-line bg-surface/40 p-6">
        <h2 className="font-display text-lg font-semibold text-fg">{t('profile.changePassword')}</h2>
        <form onSubmit={changePassword} className="mt-5 max-w-sm space-y-4">
          {hasPassword && (
            <Input
              label={t('profile.currentPassword')}
              type="password"
              required
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          )}
          <Input
            label={t('auth.newPassword')}
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <Button type="submit" loading={pwLoading}>
            {t('profile.changePassword')}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="font-display text-lg font-semibold text-danger">{t('profile.dangerZone')}</h2>
        <p className="mt-2 max-w-md text-sm text-muted">{t('profile.deleteConfirm')}</p>
        <button
          type="button"
          onClick={deleteAccount}
          disabled={delLoading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {t('profile.deleteAccount')}
        </button>
      </section>
    </>
  );
}
