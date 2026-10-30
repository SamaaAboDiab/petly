import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Heart, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

const VARIANTS = {
  success: { icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  love: { icon: Heart, className: 'bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300' },
  info: { icon: Info, className: 'bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300' },
  error: { icon: AlertCircle, className: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' },
};

export default function Toaster({ toasts, onDismiss }) {
  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:bottom-6 lg:right-6 lg:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map(({ id, title, description, variant }) => {
          const { icon: Icon, className } = VARIANTS[variant] ?? VARIANTS.success;
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface p-3 pr-2 shadow-lift"
            >
              <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', className)}>
                <Icon className="size-5" fill={variant === 'love' ? 'currentColor' : 'none'} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{title}</p>
                {description && <p className="truncate text-xs text-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(id)}
                aria-label="Dismiss"
                className="focus-ring grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
