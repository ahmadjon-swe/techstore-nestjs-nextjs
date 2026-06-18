import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { cart, users } from '@/lib/api';
import { formatPrice, PAYMENT_PROVIDER_LABELS } from '@/lib/utils';
import { CheckoutForm } from '@/components/cart/CheckoutForm';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const token = await requireAuth();
  const [cartData, addresses] = await Promise.all([
    cart.get(token).catch(() => null),
    users.addresses(token).catch(() => []),
  ]);

  if (!cartData || cartData.items.length === 0) redirect('/cart');

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-fg">Checkout</h1>

      {/* Order summary */}
      <div className="bg-surface border border-line rounded-lg p-5 space-y-3">
        <h2 className="font-medium text-fg text-sm uppercase tracking-wide">Order summary</h2>
        {cartData.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-muted truncate mr-4">
              {item.variant.product?.titleEn} × {item.quantity}
            </span>
            <span className="text-fg tabular-nums shrink-0">
              {formatPrice(String(BigInt(item.variant.priceUzs) * BigInt(item.quantity)))}
            </span>
          </div>
        ))}
        <div className="border-t border-line pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(cartData.total)}</span>
        </div>
      </div>

      <CheckoutForm addresses={addresses} providers={Object.keys(PAYMENT_PROVIDER_LABELS)} providerLabels={PAYMENT_PROVIDER_LABELS} />
    </div>
  );
}
