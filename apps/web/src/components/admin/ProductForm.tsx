'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { SpecsEditor, specsToGroups, groupsToSpecs, type SpecGroup } from './SpecsEditor';

interface ProductFormProps {
  product?: any;
  categories: any[];
  brands: any[];
}

export function ProductForm({ product, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [condition, setCondition] = useState<'NEW' | 'USED'>(product?.condition ?? 'NEW');
  const [form, setForm] = useState({
    titleEn: product?.titleEn ?? '',
    titleUz: product?.titleUz ?? '',
    titleRu: product?.titleRu ?? '',
    slug: product?.slug ?? '',
    descriptionEn: product?.descriptionEn ?? '',
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    brandId: product?.brandId ?? '',
    grade: product?.grade ?? 'B',
    conditionNotes: product?.conditionNotes ?? '',
    batteryHealth: product?.batteryHealth ?? '',
    // Details & specs
    releaseYear: product?.releaseYear ?? '',
    modelName: product?.modelName ?? '',
    mpn: product?.mpn ?? '',
    warrantyMonths: product?.warrantyMonths ?? '',
    weightGrams: product?.weightGrams ?? '',
    highlights: (product?.highlights ?? []).join('\n'),
    // For new products, create first variant inline
    priceUzs: product?.variants?.[0]?.priceUzs ?? '',
    compareAtUzs: product?.variants?.[0]?.compareAtUzs ?? '',
    sku: product?.variants?.[0]?.sku ?? '',
    stock: product?.variants?.[0]?.stock ?? (condition === 'USED' ? 1 : 0),
  });
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>(specsToGroups(product?.specs));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        titleEn: form.titleEn,
        titleUz: form.titleUz || form.titleEn,
        titleRu: form.titleRu || form.titleEn,
        slug: form.slug || form.titleEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        descriptionEn: form.descriptionEn || undefined,
        categoryId: form.categoryId,
        brandId: form.brandId || undefined,
        condition,
        ...(condition === 'USED' && {
          grade: form.grade,
          conditionNotes: form.conditionNotes || undefined,
          batteryHealth: form.batteryHealth ? Number(form.batteryHealth) : undefined,
        }),
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        modelName: form.modelName || undefined,
        mpn: form.mpn || undefined,
        warrantyMonths: form.warrantyMonths ? Number(form.warrantyMonths) : undefined,
        weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
        highlights: form.highlights
          ? String(form.highlights).split('\n').map((h: string) => h.trim()).filter(Boolean)
          : undefined,
        specs: groupsToSpecs(specGroups),
      };

      if (!isEdit) {
        body.variants = [{
          sku: form.sku || `SKU-${Date.now()}`,
          priceUzs: form.priceUzs,
          compareAtUzs: form.compareAtUzs || undefined,
          stock: Number(form.stock),
        }];
      }

      const url = isEdit ? `/api/inventory/products/${product.id}` : '/api/inventory/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? 'Error saving product'); return; }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-6 space-y-5">
      {/* Condition toggle — first-class per SPEC */}
      <div>
        <label className="text-xs uppercase tracking-wide text-muted block mb-2">Condition</label>
        <div className="flex gap-2">
          {(['NEW', 'USED'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors border ${
                condition === c
                  ? c === 'NEW' ? 'bg-new text-white border-new' : 'bg-used text-white border-used'
                  : 'border-line text-muted hover:border-faint'
              }`}
            >
              {c === 'NEW' ? 'New' : 'Used'}
            </button>
          ))}
        </div>
      </div>

      {[
        { key: 'titleEn', label: 'Title (English) *', required: true },
        { key: 'titleUz', label: 'Title (Uzbek)' },
        { key: 'titleRu', label: 'Title (Russian)' },
        { key: 'slug', label: 'URL slug (auto-generated if empty)' },
        { key: 'descriptionEn', label: 'Description (English)', multiline: true },
      ].map(({ key, label, required, multiline }) => (
        <div key={key} className="space-y-1">
          <label className="text-xs text-muted">{label}</label>
          {multiline ? (
            <textarea
              value={form[key as keyof typeof form] as string}
              onChange={(e) => set(key, e.target.value)}
              rows={3}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          ) : (
            <input
              required={required}
              value={form[key as keyof typeof form] as string}
              onChange={(e) => set(key, e.target.value)}
              className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          )}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted">Category *</label>
          <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent">
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nameEn}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted">Brand</label>
          <select value={form.brandId} onChange={(e) => set('brandId', e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent">
            <option value="">No brand</option>
            {brands.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Used device fields */}
      {condition === 'USED' && (
        <div className="border border-used/30 rounded-lg p-4 space-y-4 bg-used/5">
          <p className="text-xs font-medium uppercase tracking-wide text-used">Used device details</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted">Grade</label>
              <select value={form.grade} onChange={(e) => set('grade', e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent">
                <option value="A">A — Like new</option>
                <option value="B">B — Light wear</option>
                <option value="C">C — Visible wear</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Battery health (%)</label>
              <input type="number" min="0" max="100" value={form.batteryHealth} onChange={(e) => set('batteryHealth', e.target.value)} className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" placeholder="e.g. 89" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Condition notes</label>
            <textarea value={form.conditionNotes} onChange={(e) => set('conditionNotes', e.target.value)} rows={2} placeholder="Scratches, dents, accessories included…" className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
          </div>
        </div>
      )}

      {/* Details & specs */}
      <div className="border border-line rounded-lg p-4 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Details &amp; specs</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { key: 'releaseYear', label: 'Release year', placeholder: '2024' },
            { key: 'modelName', label: 'Model name', placeholder: 'iPhone 15 Pro' },
            { key: 'mpn', label: 'MPN / part no.', placeholder: 'MU7E3' },
            { key: 'warrantyMonths', label: 'Warranty (months)', placeholder: '12' },
            { key: 'weightGrams', label: 'Weight (grams)', placeholder: '221' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-muted">{label}</label>
              <input
                value={form[key as keyof typeof form] as string}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted">Highlights (one per line)</label>
          <textarea
            value={form.highlights}
            onChange={(e) => set('highlights', e.target.value)}
            rows={3}
            placeholder={'Titanium design\nA17 Pro chip\n5x telephoto camera'}
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <SpecsEditor value={specGroups} onChange={setSpecGroups} />
      </div>

      {/* First variant (new products only) */}
      {!isEdit && (
        <div className="border border-line rounded-lg p-4 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">First variant</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted">SKU</label>
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="Auto-generated if empty" className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Stock {condition === 'USED' ? '(usually 1)' : ''}</label>
              <input type="number" min="0" required value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted">Price (UZS) *</label>
              <input type="number" required value={form.priceUzs} onChange={(e) => set('priceUzs', e.target.value)} placeholder="e.g. 14500000" className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Compare-at price</label>
              <input type="number" value={form.compareAtUzs} onChange={(e) => set('compareAtUzs', e.target.value)} placeholder="Optional" className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-danger text-xs">{error}</p>}
      <Button type="submit" loading={loading}>{isEdit ? 'Save changes' : 'Create product'}</Button>
    </form>
  );
}
