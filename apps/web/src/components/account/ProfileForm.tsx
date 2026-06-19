'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';
import type { UserProfile } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n';

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const { t } = useT();
  const [name, setName] = useState(profile.name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [loading, setLoading] = useState(false);

  const needsPhone = !profile.phone;

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(Array.isArray(data.message) ? data.message.join(', ') : data.message ?? t('common.error'));
        return;
      }
      toast.success(t('profile.saved'));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface/40 p-6">
      <h2 className="font-display text-lg font-semibold text-fg">{t('profile.title')}</h2>

      {needsPhone && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-warning">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {t('profile.phoneRequired')}
        </div>
      )}

      <form onSubmit={saveProfile} className="mt-5 max-w-sm space-y-4">
        <Input label={t('auth.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <Input
          label={`${t('auth.phone')} (+998…)`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998901234567"
          autoComplete="tel"
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted">{t('auth.email')}</label>
          <input
            disabled
            value={profile.email ?? '—'}
            className="w-full rounded-xl border border-line bg-bg-2/60 px-4 py-3 text-sm text-faint"
          />
          {profile.isGoogleLinked && <p className="text-[11px] text-faint">Linked with Google</p>}
        </div>
        <Button type="submit" loading={loading}>
          {t('profile.save')}
        </Button>
      </form>
    </section>
  );
}
