'use client';

import { Moon, Sun } from 'lucide-react';
import { usePrefs } from '@/store/prefs';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = usePrefs((s) => s.theme);
  const toggleTheme = usePrefs((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-line text-muted transition-colors hover:border-faint hover:text-fg ${className}`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
}
