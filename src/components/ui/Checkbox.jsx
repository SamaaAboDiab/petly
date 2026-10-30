import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Pass `label` for visible text, or `ariaLabel` for an icon-only checkbox. */
export default function Checkbox({ checked, onChange, label, ariaLabel, round = false, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn('focus-ring group inline-flex items-center gap-2.5 rounded-lg text-sm text-ink', className)}
    >
      <span
        className={cn(
          'grid size-6 shrink-0 place-items-center border-2 transition-all duration-200',
          round ? 'rounded-full' : 'rounded-lg',
          checked
            ? 'border-brand-400 bg-brand-400 text-on-brand'
            : 'border-line bg-surface group-hover:border-brand-300',
        )}
      >
        <motion.span initial={false} animate={{ scale: checked ? 1 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }}>
          <Check className="size-3.5" strokeWidth={3.5} />
        </motion.span>
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}
