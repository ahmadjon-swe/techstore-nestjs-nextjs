'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function CatalogSearch({
  defaultValue,
  params,
}: {
  defaultValue?: string;
  params: Record<string, string>;
}) {
  const [q, setQ] = useState(defaultValue ?? '');
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params);
    if (q.trim()) p.set('search', q.trim());
    else p.delete('search');
    p.delete('page');
    router.push(`/catalog?${p.toString()}`);
  }

  return (
    <form onSubmit={submit}>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-faint">Search</p>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-bg-2/60 px-3 py-2 focus-within:border-accent/60">
        <Search className="h-4 w-4 shrink-0 text-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="iPhone, MacBook…"
          className="w-full bg-transparent text-sm text-fg placeholder:text-faint focus:outline-none"
        />
      </div>
    </form>
  );
}
