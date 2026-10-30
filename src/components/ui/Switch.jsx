import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/** Accessible on/off toggle. Use `label` for screen readers when there's no visible text. */
export default function Switch({ checked, onChange, label, disabled, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-ring flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors disabled:opacity-50',
        checked ? 'bg-brand-400' : 'bg-line',
        className,
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 32 }}
        className={cn('size-5 rounded-full bg-white shadow', checked && 'ml-auto')}
      />
    </button>
  );
}
