'use client';

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

/** Theme + language controls pinned to the corner of the full-screen auth pages. */
export function AuthControls() {
  return (
    <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
      <ThemeToggle />
      <LanguageSwitcher />
    </div>
  );
}
