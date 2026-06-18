'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminPublishToggle({ productId, published }: { productId: string; published: boolean }) {
  const router = useRouter();
  const [val, setVal] = useState(published);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const action = val ? 'unpublish' : 'publish';
    await fetch(`/api/inventory/products/${productId}/${action}`, { method: 'PATCH' });
    setVal(!val);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${val ? 'bg-success' : 'bg-elevated'} disabled:opacity-50`}
      aria-label={val ? 'Unpublish' : 'Publish'}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${val ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );
}
