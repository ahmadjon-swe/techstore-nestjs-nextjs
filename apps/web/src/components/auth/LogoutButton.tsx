'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/cn';

/** Posts to the logout route (clears cookies) and returns home. */
export function LogoutButton({
  className,
  variant = 'inline',
}: {
  className?: string;
  variant?: 'inline' | 'icon';
}) {
  const router = useRouter();
  const { t } = useT();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        aria-label={t('nav.signout')}
        className={cn('grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:border-faint hover:text-fg disabled:opacity-50', className)}
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className={cn('flex items-center gap-2 text-sm text-muted hover:text-fg disabled:opacity-50', className)}
    >
      <LogOut className="h-4 w-4" />
      {t('nav.signout')}
    </button>
  );
}
