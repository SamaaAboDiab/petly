import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Styled replacement for a native <select> (whose open list can't be themed).
 * Keyboard: Enter/Space/Arrow keys open it, arrows move, Enter picks, Escape closes.
 */
export default function Select({ value, onChange, options, label, icon: Icon, align = 'right', className }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const openList = () => {
    setHighlighted(Math.max(0, options.indexOf(selected)));
    setOpen(true);
  };

  const pick = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === 'Escape' || event.key === 'Tab') setOpen(false);
    else if (event.key === 'ArrowDown') setHighlighted((i) => (i + 1) % options.length);
    else if (event.key === 'ArrowUp') setHighlighted((i) => (i - 1 + options.length) % options.length);
    else if (event.key === 'Enter' || event.key === ' ') pick(options[highlighted]);
    else return;
    event.preventDefault();
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label ? `${label}: ${selected.label}` : undefined}
        aria-activedescendant={open ? `${listId}-${highlighted}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={cn(
          'focus-ring flex items-center gap-2 rounded-xl border bg-surface px-3 py-2 text-sm font-semibold text-ink transition',
          open ? 'border-brand-400 ring-4 ring-brand-300/30' : 'border-line hover:border-brand-300',
        )}
      >
        {Icon && <Icon className="size-4 text-muted" />}
        <span className="whitespace-nowrap">{selected.label}</span>
        <ChevronDown className={cn('size-4 text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full z-30 mt-2 min-w-full w-max space-y-0.5 rounded-2xl border border-line bg-surface p-1.5 shadow-lift',
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === selected.value;
              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setHighlighted(index)}
                  onClick={() => pick(option)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    'text-ink',
                    isSelected && 'font-semibold',
                    index === highlighted && 'bg-brand-100 dark:bg-brand-400/15',
                  )}
                >
                  {option.label}
                  <Check className={cn('size-4 text-brand-600 dark:text-brand-300', !isSelected && 'invisible')} />
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
