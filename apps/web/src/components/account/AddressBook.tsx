'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';
import type { Address } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n';
import type { PickedLocation } from '@/components/map/LocationPicker';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker').then((m) => m.LocationPicker),
  { ssr: false, loading: () => <div className="h-56 w-full animate-pulse rounded-lg bg-elevated" /> },
);

const EMPTY_FORM = { label: '', line1: '', city: '', region: '', notes: '' };

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const { t } = useT();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function handleLocation(loc: PickedLocation) {
    setCoords({ lat: loc.lat, lng: loc.lng });
    // Pre-fill city from reverse geocoding if empty
    if (loc.displayName && !form.city) {
      const parts = loc.displayName.split(',').map((s) => s.trim());
      const city = parts.find((p) => /toshkent|tashkent|ташкент/i.test(p)) ?? parts[parts.length - 4] ?? '';
      if (city) setForm((f) => ({ ...f, city: city.trim() }));
    }
  }

  async function handleAdd() {
    if (!form.line1 || !form.city) return;
    setLoading(true);
    try {
      await fetch('/api/users/me/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: form.label || undefined,
          line1: form.line1,
          city: form.city,
          region: form.region || undefined,
          notes: form.notes || undefined,
          isDefault: addresses.length === 0,
          lat: coords?.lat ?? undefined,
          lng: coords?.lng ?? undefined,
        }),
      });
      setAdding(false);
      setForm(EMPTY_FORM);
      setCoords(null);
      setShowMap(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/users/me/addresses/${id}`, { method: 'DELETE' });
    router.refresh();
    setDeleting(null);
  }

  function field(key: keyof typeof EMPTY_FORM, placeholder: string, required = false) {
    return (
      <input
        required={required}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded border border-line px-3 py-2 text-sm focus:outline-none focus:border-accent bg-transparent"
      />
    );
  }

  return (
    <section className="bg-surface border border-line rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-fg flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" /> {t('profile.addresses')}
        </h2>
        {!adding && (
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t('profile.addAddress')}
          </Button>
        )}
      </div>

      {/* Saved addresses */}
      {addresses.length === 0 && !adding && (
        <p className="text-sm text-muted">{t('profile.noAddresses')}</p>
      )}

      <div className="space-y-2">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`flex items-start justify-between rounded-lg border px-4 py-3 ${
              a.isDefault ? 'border-accent/40 bg-accent/5' : 'border-line'
            }`}
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                {a.label && <p className="text-xs font-medium uppercase tracking-wide text-faint">{a.label}</p>}
                {a.isDefault && (
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-accent">
                    <Star className="h-3 w-3 fill-current" /> {t('profile.default')}
                  </span>
                )}
              </div>
              <p className="text-sm text-fg">{a.line1}</p>
              <p className="text-xs text-muted">{[a.city, a.region].filter(Boolean).join(', ')}</p>
              {a.notes && <p className="text-xs text-faint italic mt-0.5">{a.notes}</p>}
              {a.lat && a.lng && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lng}#map=16/${a.lat}/${a.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-accent hover:underline"
                >
                  {t('profile.viewOnMap')}
                </a>
              )}
            </div>
            <button
              onClick={() => handleDelete(a.id)}
              disabled={deleting === a.id}
              className="ml-4 shrink-0 text-faint hover:text-danger transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add-address form */}
      {adding && (
        <div className="rounded-lg border border-dashed border-line p-4 space-y-3">
          {field('label', t('checkout.addressLabel'))}
          {field('line1', t('checkout.street'), true)}
          <div className="grid grid-cols-2 gap-3">
            {field('city', t('checkout.city'), true)}
            {field('region', t('checkout.region'))}
          </div>
          {field('notes', t('profile.notes'))}

          {/* Map toggle */}
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-accent hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            {showMap ? t('profile.hideMap') : t('profile.pinOnMap')}
          </button>

          {showMap && (
            <LocationPicker
              initialLat={coords?.lat}
              initialLng={coords?.lng}
              onChange={handleLocation}
            />
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleAdd} loading={loading}>{t('profile.save')}</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setForm(EMPTY_FORM); setCoords(null); setShowMap(false); }}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
