import { cn } from '@/lib/cn';

/** Glass surface card. `glow` adds the animated conic-gradient hover border. */
export function Card({
  className,
  glow,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface/60 backdrop-blur-md',
        glow && 'border-glow',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
