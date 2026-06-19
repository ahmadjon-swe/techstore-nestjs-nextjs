'use client';

import { create } from 'zustand';

interface WishlistState {
  ids: Set<string>;
  loaded: boolean;
  load: () => Promise<void>;
  /** Optimistically toggle; returns 'saved' | 'removed' | 'auth' (needs login). */
  toggle: (productId: string) => Promise<'saved' | 'removed' | 'auth'>;
  isSaved: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch('/api/wishlist/ids', { cache: 'no-store' });
      const ids: string[] = res.ok ? await res.json() : [];
      set({ ids: new Set(ids), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: async (productId) => {
    const has = get().ids.has(productId);
    // optimistic
    set((s) => {
      const next = new Set(s.ids);
      has ? next.delete(productId) : next.add(productId);
      return { ids: next };
    });
    try {
      const res = await fetch(`/api/wishlist/${productId}/toggle`, { method: 'POST' });
      if (res.status === 401) {
        // revert + signal auth needed
        set((s) => {
          const next = new Set(s.ids);
          has ? next.add(productId) : next.delete(productId);
          return { ids: next };
        });
        return 'auth';
      }
      const data: { saved: boolean } = await res.json();
      // reconcile with server truth
      set((s) => {
        const next = new Set(s.ids);
        data.saved ? next.add(productId) : next.delete(productId);
        return { ids: next };
      });
      return data.saved ? 'saved' : 'removed';
    } catch {
      // revert on network error
      set((s) => {
        const next = new Set(s.ids);
        has ? next.add(productId) : next.delete(productId);
        return { ids: next };
      });
      return has ? 'saved' : 'removed';
    }
  },

  isSaved: (productId) => get().ids.has(productId),
}));
