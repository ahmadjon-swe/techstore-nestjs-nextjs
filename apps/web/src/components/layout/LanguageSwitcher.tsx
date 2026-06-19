'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Globe } from 'lucide-react';
import { usePrefs, type Locale } from '@/store/prefs';
import { cn } from '@/lib/cn';

const LANGS: { code: Locale; label: string; short: string }[] = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
];

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const router = useRouter();
  const locale = usePrefs((s) => s.locale);
  const setLocale = usePrefs((s) => s.setLocale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium text-muted transition-colors hover:border-faint hover:text-fg"
      >
        <Globe className="h-3.5 w-3.5" />
        {current.short}
      </button>

      {open && (
        <div className="glass absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
                router.refresh();
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                l.code === locale ? 'bg-accent/10 text-fg' : 'text-muted hover:bg-fg/5 hover:text-fg',
              )}
            >
              {l.label}
              {l.code === locale && <Check className="h-3.5 w-3.5 text-accent-ink" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
