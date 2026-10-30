import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/cn';

const BURST = Array.from({ length: 6 }, (_, i) => (i * 360) / 6);

export default function FavoriteButton({ active, onToggle, size = 'md', className }) {
  const dimension = size === 'sm' ? 'size-8' : size === 'lg' ? 'size-12' : 'size-10';
  const iconSize = size === 'lg' ? 'size-6' : size === 'sm' ? 'size-4' : 'size-5';

  return (
    <motion.button
      type="button"
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      onClick={onToggle}
      whileTap={{ scale: 0.8 }}
      className={cn(
        'focus-ring relative grid place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-colors hover:bg-white dark:bg-black/45',
        dimension,
        className,
      )}
    >
      <motion.span
        key={String(active)}
        initial={{ scale: active ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
      >
        <Heart
          className={cn(iconSize, active ? 'fill-rose-500 text-rose-500' : 'text-ink dark:text-white')}
        />
      </motion.span>
      <AnimatePresence>
        {active &&
          BURST.map((angle) => (
            <motion.span
              key={angle}
              className="pointer-events-none absolute size-1.5 rounded-full bg-rose-400"
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                x: Math.cos((angle * Math.PI) / 180) * 22,
                y: Math.sin((angle * Math.PI) / 180) * 22,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
    </motion.button>
  );
}
