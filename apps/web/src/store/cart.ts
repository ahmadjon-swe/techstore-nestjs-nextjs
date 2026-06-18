'use client';

import { create } from 'zustand';

interface CartUIState {
  isOpen: boolean;
  count: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setCount: (n: number) => void;
  bump: (delta: number) => void;
}

/** Lightweight client store for cart-drawer UI + an optimistic item count badge.
 *  The authoritative cart still lives on the server; this drives instant UX. */
export const useCartUI = create<CartUIState>((set) => ({
  isOpen: false,
  count: 0,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setCount: (n) => set({ count: Math.max(0, n) }),
  bump: (delta) => set((s) => ({ count: Math.max(0, s.count + delta) })),
}));
