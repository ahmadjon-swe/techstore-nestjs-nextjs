'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Address } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: '', line1: '', city: '', region: '' });
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    await fetch('/api/users/me/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setAdding(false);
    setForm({ label: '', line1: '', city: '', region: '' });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/users/me/addresses/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <section className="bg-surface border border-line rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-fg">Addresses</h2>
        <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>+ Add</Button>
      </div>

      {addresses.length === 0 && !adding && (
        <p className="text-sm text-muted">No saved addresses.</p>
      )}

      {addresses.map((a) => (
        <div key={a.id} className="flex items-start justify-between border border-line rounded px-4 py-3">
          <div className="space-y-0.5">
            {a.label && <p className="text-xs font-medium text-muted uppercase">{a.label}</p>}
            <p className="text-sm text-fg">{a.line1}</p>
            <p className="text-xs text-muted">{[a.city, a.region].filter(Boolean).join(', ')}</p>
          </div>
          <button onClick={() => handleDelete(a.id)} className="text-xs text-danger hover:underline ml-4">Delete</button>
        </div>
      ))}

      {adding && (
        <div className="border border-line rounded p-4 space-y-3">
          {[
            { key: 'label', placeholder: 'Label (e.g. Home)' },
            { key: 'line1', placeholder: 'Street address *' },
            { key: 'city', placeholder: 'City *' },
            { key: 'region', placeholder: 'Region' },
          ].map(({ key, placeholder }) => (
            <input
              key={key}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          ))}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} loading={loading}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </section>
  );
}
