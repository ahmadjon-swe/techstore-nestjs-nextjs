'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface StockEditorProps {
  variantId: string;
  sku: string;
  currentStock: number;
}

export function StockEditor({ variantId, sku, currentStock }: StockEditorProps) {
  const router = useRouter();
  const [delta, setDelta] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleAdjust() {
    if (delta === 0) return;
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/inventory/variants/${variantId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (res.ok) {
      setMsg('Updated.');
      setDelta(0);
      router.refresh();
    } else {
      setMsg('Error.');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-muted w-40 truncate">{sku}</span>
      <span className="tabular-nums text-fg">Stock: {currentStock}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={delta}
          onChange={(e) => setDelta(Number(e.target.value))}
          className="w-20 border border-line rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-accent"
          placeholder="±delta"
        />
        <Button size="sm" variant="ghost" onClick={handleAdjust} loading={loading} disabled={delta === 0}>
          Adjust
        </Button>
        {msg && <span className="text-xs text-muted">{msg}</span>}
      </div>
    </div>
  );
}
