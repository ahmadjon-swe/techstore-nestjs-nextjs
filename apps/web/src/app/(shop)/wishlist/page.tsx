import type { Metadata } from 'next';
import { Heart } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { wishlist, type ProductSummary } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { WishlistHeading, WishlistEmptyState } from '@/components/product/WishlistHeading';

export const metadata: Metadata = { title: 'Wishlist' };
export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const token = await requireAuth();
  const items: ProductSummary[] = await wishlist.list(token).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 border-b border-line pb-8">
        <WishlistHeading count={items.length} />
      </div>

      {items.length === 0 ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-dashed border-line py-28 text-center">
          <Heart className="h-10 w-10 text-faint" />
          <WishlistEmptyState />
        </div>
      ) : (
        <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5" stagger={0.05}>
          {items.map((p) => (
            <RevealItem key={p.id}>
              <ProductCard product={p} />
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
