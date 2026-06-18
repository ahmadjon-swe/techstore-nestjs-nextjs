'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Address } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface CheckoutFormProps {
  addresses: Address[];
  providers: string[];
  providerLabels: Record<string, string>;
}

export function CheckoutForm({ addresses, providers, providerLabels }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '',
  );
  const [newAddress, setNewAddress] = useState({ line1: '', city: '', region: '' });
  const [useNew, setUseNew] = useState(addresses.length === 0);
  const [provider, setProvider] = useState(providers[0] ?? 'CASH');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = { paymentProvider: provider };
      if (useNew) {
        body.address = { line1: newAddress.line1, city: newAddress.city, region: newAddress.region };
      } else {
        body.addressId = selectedAddress;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? 'Order failed'); return; }

      if (provider !== 'CASH') {
        const payRes = await fetch(`/api/payments/${data.id}/initiate`, { method: 'POST' });
        const payData = await payRes.json();
        if (payData.checkoutUrl) { window.location.href = payData.checkoutUrl; return; }
      }
      router.push(`/orders/${data.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delivery address */}
      <div className="bg-surface border border-line rounded-lg p-5 space-y-4">
        <h2 className="font-medium text-fg text-sm uppercase tracking-wide">Delivery address</h2>

        {addresses.length > 0 && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={!useNew} onChange={() => setUseNew(false)} className="accent-[var(--color-accent)]" />
              <span className="text-sm">Use saved address</span>
            </label>
            {!useNew && (
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full border border-line rounded px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label ? `${a.label} — ` : ''}{a.line1}, {a.city}
                  </option>
                ))}
              </select>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={useNew} onChange={() => setUseNew(true)} className="accent-[var(--color-accent)]" />
              <span className="text-sm">Enter new address</span>
            </label>
          </div>
        )}

        {(useNew || addresses.length === 0) && (
          <div className="space-y-3">
            <input
              required
              placeholder="Street address *"
              value={newAddress.line1}
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="City *"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
              <input
                placeholder="Region"
                value={newAddress.region}
                onChange={(e) => setNewAddress({ ...newAddress, region: e.target.value })}
                className="border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="bg-surface border border-line rounded-lg p-5 space-y-3">
        <h2 className="font-medium text-fg text-sm uppercase tracking-wide">Payment method</h2>
        <div className="grid grid-cols-3 gap-2">
          {providers.map((p) => (
            <label
              key={p}
              className={[
                'flex items-center justify-center p-3 rounded border cursor-pointer text-sm font-medium transition-colors',
                provider === p ? 'border-accent bg-accent/10 text-fg' : 'border-line hover:border-faint',
              ].join(' ')}
            >
              <input
                type="radio"
                name="provider"
                value={p}
                checked={provider === p}
                onChange={() => setProvider(p)}
                className="sr-only"
              />
              {providerLabels[p] ?? p}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Place order
      </Button>
    </form>
  );
}
