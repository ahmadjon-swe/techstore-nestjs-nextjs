import { cn } from '@/lib/cn';

type Tone = 'new' | 'used' | 'accent' | 'neutral' | 'success' | 'danger';

const tones: Record<Tone, string> = {
  new: 'text-new border-new/30 bg-new/10',
  used: 'text-used border-used/30 bg-used/10',
  accent: 'text-accent-ink border-accent/30 bg-accent/10',
  neutral: 'text-muted border-line bg-white/5',
  success: 'text-success border-success/30 bg-success/10',
  danger: 'text-danger border-danger/30 bg-danger/10',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide backdrop-blur-sm',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
