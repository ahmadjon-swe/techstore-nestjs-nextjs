import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/cn';

interface PriceDisplayProps {
  priceUzs: string;
  compareAtUzs?: string | null;
  className?: string;
  size?: 'sm' | 'lg';
}

export function PriceDisplay({ priceUzs, compareAtUzs, className, size = 'sm' }: PriceDisplayProps) {
  const discounted = compareAtUzs && parseInt(compareAtUzs) > parseInt(priceUzs);
  return (
    <div className={cn('flex flex-wrap items-baseline gap-2 font-mono tabular-nums', className)}>
      <span className={cn('font-semibold text-fg', size === 'lg' ? 'text-2xl' : 'text-base')}>
        {formatPrice(priceUzs)}
      </span>
      {discounted && (
        <span className={cn('text-faint line-through', size === 'lg' ? 'text-base' : 'text-xs')}>
          {formatPrice(compareAtUzs)}
        </span>
      )}
    </div>
  );
}
