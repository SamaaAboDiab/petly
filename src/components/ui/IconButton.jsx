import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

const VARIANTS = {
  surface: 'bg-surface border border-line text-ink hover:border-brand-300 hover:text-brand-600',
  ghost: 'text-ink hover:bg-surface-2',
  glass: 'bg-white/85 text-ink backdrop-blur hover:bg-white dark:bg-black/40 dark:text-white dark:hover:bg-black/60',
  brand: 'bg-brand-400 text-on-brand shadow-glow hover:bg-brand-300',
};

export default function IconButton({
  icon: Icon,
  label,
  badge,
  dot = false,
  variant = 'surface',
  size = 'md',
  className,
  iconClassName,
  ...props
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'focus-ring relative inline-grid shrink-0 place-items-center rounded-full transition-colors duration-200',
        size === 'sm' ? 'size-9' : 'size-11',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      <Icon className={cn(size === 'sm' ? 'size-4' : 'size-5', iconClassName)} />
      {dot && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand-400 ring-2 ring-surface" />}
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-brand-400 px-1 text-[11px] font-bold text-on-brand ring-2 ring-canvas"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
