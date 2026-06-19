'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';
export type Locale = 'uz' | 'ru' | 'en';

interface PrefsState {
  theme: Theme;
  locale: Locale;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setLocale: (l: Locale) => void;
}

/** Reflect the chosen theme onto <html> (the `.light` class drives the palette). */
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light', theme === 'light');
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      locale: 'uz',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'techstore-prefs',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
