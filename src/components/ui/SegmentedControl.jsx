import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/lib/cn';

/** Pill tabs with a sliding active indicator. */
export default function SegmentedControl({ options, value, onChange, className }) {
  const layoutId = useId();
  return (
    <div role="tablist" className={cn('flex rounded-2xl bg-surface-2 p-1', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'focus-ring relative flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors',
              active ? 'text-on-brand' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-brand-400 shadow-glow"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex items-center justify-center gap-2">
              {option.label}
              {option.count !== undefined && (
                <span className="rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/10">{option.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
