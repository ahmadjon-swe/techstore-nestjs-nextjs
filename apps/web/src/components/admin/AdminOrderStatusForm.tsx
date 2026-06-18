'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Props {
  orderId: string;
  currentStatus: string;
  statuses: string[];
  statusLabels: Record<string, string>;
}

export function AdminOrderStatusForm({ orderId, currentStatus, statuses, statusLabels }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setMsg(res.ok ? 'Status updated.' : 'Failed to update status.');
    if (res.ok) router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-line rounded px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{statusLabels[s] ?? s}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleSubmit} loading={loading} disabled={status === currentStatus}>
        Update
      </Button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}
