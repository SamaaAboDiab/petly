import { cn } from '@/lib/cn';

/** Shimmering placeholder block. Compose it to mirror the real layout. */
export default function Skeleton({ className, rounded = 'rounded-xl', ...props }) {
  return (
    <div aria-hidden className={cn('relative overflow-hidden bg-surface-2', rounded, className)} {...props}>
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/[0.06]" />
    </div>
  );
}
