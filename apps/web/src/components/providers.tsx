'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { LazyMotion, domAnimation, MotionConfig } from 'framer-motion';
import Lenis from 'lenis';
import { usePrefs } from '@/store/prefs';

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = usePrefs((s) => s.theme);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  // Guarantee the theme class is in sync with the store after hydration
  // (covers the case where persist rehydration races the first paint).
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Buttery smooth inertial scrolling. Skipped when the user prefers reduced
  // motion and on the admin panel (sticky sidebar + long tables fight Lenis).
  useEffect(() => {
    if (isAdmin) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.05, lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [isAdmin]);

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster
            position="bottom-right"
            theme={theme}
            toastOptions={{
              style: {
                background: 'color-mix(in oklab, var(--color-surface) 92%, transparent)',
                border: '1px solid var(--color-line)',
                color: 'var(--color-fg)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  );
}
