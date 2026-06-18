'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight ' +
  'select-none whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none ' +
  'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none';

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-[linear-gradient(110deg,var(--color-accent),var(--color-accent-2))] ' +
    'shadow-[0_8px_30px_-8px_color-mix(in_oklab,var(--color-accent)_70%,transparent)] ' +
    'hover:shadow-[0_12px_44px_-8px_color-mix(in_oklab,var(--color-accent)_85%,transparent)]',
  secondary: 'text-fg bg-elevated border border-line hover:border-faint hover:bg-[#161a26]',
  ghost: 'text-muted hover:text-fg hover:bg-white/5',
  outline: 'text-fg border border-line hover:border-accent/60 hover:text-accent-ink bg-transparent',
  danger: 'text-white bg-danger/90 hover:bg-danger',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
