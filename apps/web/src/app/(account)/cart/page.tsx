import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { requireAuth } from '@/lib/auth';
import { cart } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { CartActions } from '@/components/cart/CartActions';

export const metadata: Metadata = { title: 'Your Cart' };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function CartPage() {
  const token = await requireAuth();
  const cartData = await cart.get(token).catch(() => null);

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <h1 className="font-display text-3xl text-fg">Your cart is empty</h1>
        <p className="text-muted">Browse our catalog to find something you'll love.</p>
        <Link href="/catalog" className="inline-block mt-4 bg-elevated text-fg px-6 py-3 rounded hover:bg-elevated transition-colors">
          Go to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-fg">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartData.items.map((item) => {
            const imgUrl = item.variant.product?.images?.[0]?.url;
            const src = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${API_URL}${imgUrl}`) : null;
            return (
              <div key={item.id} className="flex gap-4 bg-surface rounded-lg p-4 border border-line">
                <div className="relative w-20 h-20 bg-bg-2 rounded overflow-hidden shrink-0">
                  {src && <Image src={src} alt="" fill className="object-contain p-1" sizes="80px" />}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <Link href={`/products/${item.variant.product?.slug ?? ''}`} className="text-sm font-medium text-fg hover:text-accent line-clamp-2">
                    {item.variant.product?.titleEn ?? 'Product'}
                  </Link>
                  {(item.variant.storage || item.variant.color) && (
                    <p className="text-xs text-muted">{[item.variant.storage, item.variant.color].filter(Boolean).join(' · ')}</p>
                  )}
                  <p className="text-sm font-semibold text-fg">{formatPrice(item.variant.priceUzs)}</p>
                </div>
                <CartActions variantId={item.variantId} quantity={item.quantity} />
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-surface border border-line rounded-lg p-6 space-y-4 h-fit sticky top-24">
          <h2 className="font-display text-xl text-fg">Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-fg">{formatPrice(cartData.total)}</span>
          </div>
          <div className="border-t border-line pt-4">
            <Link
              href="/checkout"
              className="block w-full text-center bg-elevated text-fg py-3 rounded font-medium hover:bg-elevated transition-colors"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
