'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 text-center">
      <div className="aurora opacity-40" aria-hidden />
      <div>
        <p className="font-mono text-sm tracking-widest text-danger">SYSTEM FAULT</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          Something glitched.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          An unexpected error occurred. You can try again — if it persists, we're on it.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
