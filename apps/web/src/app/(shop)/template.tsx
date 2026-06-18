'use client';

import { m } from 'framer-motion';

/** Re-mounts on every shop navigation → gives each page a soft enter transition. */
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
