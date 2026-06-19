'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { t } = useT();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm(t('order.cancelConfirm'))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? t('common.error'));
        return;
      }
      toast.success(t('order.cancelled'));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
    >
      <XCircle className="h-4 w-4" />
      {t('order.cancel')}
    </button>
  );
}
