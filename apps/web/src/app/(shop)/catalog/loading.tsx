import { ProductCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10 border-b border-line pb-8">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-10 w-64" />
      </div>
      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="hidden space-y-4 lg:block lg:w-60 lg:shrink-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </aside>
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
