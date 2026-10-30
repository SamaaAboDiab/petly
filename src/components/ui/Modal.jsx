import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export default function Modal({ open, onClose, title, children, className, hideClose = false, position = 'center' }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center p-4',
            position === 'top' ? 'items-start pt-[12vh]' : 'items-end sm:items-center',
          )}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-surface shadow-lift',
              className,
            )}
          >
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="focus-ring absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-surface-2 text-muted transition hover:rotate-90 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
