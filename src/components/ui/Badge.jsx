import { cn } from '@/lib/cn';

const VARIANTS = {
  brand: 'bg-brand-200 text-brand-700 dark:bg-brand-400/20 dark:text-brand-300',
  solid: 'bg-brand-400 text-on-brand',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  neutral: 'bg-surface-2 text-muted',
};

export default function Badge({ variant = 'brand', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        VARIANTS[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      {children}
    </span>
  );
}
