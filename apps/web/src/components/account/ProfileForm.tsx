'use client';
import { useState, FormEvent } from 'react';
import type { UserProfile } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [name, setName] = useState(profile.name ?? '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setMsg(res.ok ? 'Saved.' : 'Error saving profile.');
    setLoading(false);
  }

  return (
    <section className="bg-surface border border-line rounded-lg p-6 space-y-4">
      <h2 className="font-medium text-fg">Personal info</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div className="space-y-1">
          <label className="text-xs text-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent bg-surface"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted">Email</label>
          <input disabled value={profile.email ?? ''} className="w-full border border-line rounded px-3 py-2 text-sm bg-bg-2 text-muted" />
        </div>
        {profile.phone && (
          <div className="space-y-1">
            <label className="text-xs text-muted">Phone</label>
            <input disabled value={profile.phone} className="w-full border border-line rounded px-3 py-2 text-sm bg-bg-2 text-muted" />
          </div>
        )}
        <div className="flex items-center gap-4">
          <Button type="submit" size="sm" loading={loading}>Save</Button>
          {msg && <span className="text-xs text-muted">{msg}</span>}
        </div>
      </form>
    </section>
  );
}
