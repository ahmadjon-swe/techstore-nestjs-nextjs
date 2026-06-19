'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ROLES = ['OWNER', 'MANAGER', 'STAFF', 'CUSTOMER'] as const;
// Managers may only assign within this set.
const MANAGER_ROLES = ['STAFF', 'CUSTOMER'];

/** Inline role editor. Managers see only the Staff/Customer options. */
export function UserRoleSelect({
  userId,
  role,
  actorRole,
  editable,
}: {
  userId: string;
  role: string;
  actorRole: string;
  editable: boolean;
}) {
  const options = actorRole === 'MANAGER' ? MANAGER_ROLES : [...ROLES];
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [saving, setSaving] = useState(false);

  if (!editable) {
    return (
      <span
        className={`rounded px-2 py-0.5 text-xs font-medium ${
          role === 'OWNER'
            ? 'bg-accent/10 text-accent'
            : role === 'CUSTOMER'
              ? 'bg-elevated text-muted'
              : 'bg-new/10 text-new'
        }`}
      >
        {role}
      </span>
    );
  }

  async function change(next: string) {
    const prev = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setValue(prev);
        toast.error(data.message ?? 'Could not change role');
        return;
      }
      toast.success(`Role updated to ${next}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => change(e.target.value)}
      className="rounded border border-line bg-surface px-2 py-1 text-xs font-medium text-fg focus:border-accent focus:outline-none disabled:opacity-50"
    >
      {options.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
