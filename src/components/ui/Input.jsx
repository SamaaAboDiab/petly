import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

export default function Input({
  label,
  icon: Icon,
  error,
  hint,
  rightSlot,
  className,
  inputClassName,
  as: Component = 'input',
  ...props
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <div
        className={cn(
          'group relative flex items-center rounded-2xl border bg-surface transition-all duration-200',
          'focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-300/30',
          error ? 'border-red-400 animate-wiggle' : 'border-line hover:border-brand-200',
        )}
      >
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 size-[18px] text-muted transition-colors group-focus-within:text-brand-500" />
        )}
        <Component
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted/80',
            Icon ? 'pl-11' : 'pl-4',
            rightSlot ? 'pr-12' : 'pr-4',
            Component === 'textarea' && 'min-h-28 resize-none',
            inputClassName,
          )}
          {...props}
        />
        {rightSlot && <div className="absolute right-2">{rightSlot}</div>}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs font-medium text-red-500"
          >
            {error}
          </motion.p>
        ) : (
          hint && (
            <p id={`${id}-hint`} className="text-xs text-muted">
              {hint}
            </p>
          )
        )}
      </AnimatePresence>
    </div>
  );
}

export function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      type={visible ? 'text' : 'password'}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="focus-ring grid size-9 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  );
}
