import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary:
    'bg-brand-400 text-on-brand shadow-glow hover:bg-brand-300 hover:shadow-lift disabled:shadow-none',
  secondary:
    'bg-surface text-ink border border-line hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-surface-2',
  outline: 'border-2 border-brand-400 text-brand-600 hover:bg-brand-400 hover:text-on-brand dark:text-brand-300',
  ghost: 'text-ink hover:bg-surface-2',
  dark: 'bg-ink text-canvas hover:opacity-90',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
};

/** Shared class builder so links (<Link>) can look exactly like buttons. */
export function buttonStyles({ variant = 'primary', size = 'md', block = false, className } = {}) {
  return cn(
    'focus-ring inline-flex select-none items-center justify-center rounded-2xl font-semibold transition-all duration-200',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full',
    className,
  );
}

export default function Button({
  variant,
  size,
  block,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileHover={disabled || loading ? undefined : { y: -2 }}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, block, className })}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : LeftIcon && <LeftIcon className="size-4" />}
      {children}
      {!loading && RightIcon && <RightIcon className="size-4" />}
    </motion.button>
  );
}
