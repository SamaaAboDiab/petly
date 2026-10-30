import { motion } from 'framer-motion';
import { CATEGORIES } from '@/data/pets';
import { cn } from '@/lib/cn';
import CategoryIcon from './CategoryIcon';

export default function CategoryFilter({ value, onChange, className }) {
  return (
    <div role="tablist" aria-label="Filter by category" className={cn('grid grid-cols-4 gap-3 sm:gap-4', className)}>
      {CATEGORIES.map(({ id, label }) => {
        const active = value === id;
        return (
          <motion.button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'focus-ring group flex flex-col items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-semibold transition-colors duration-200 sm:flex-row sm:gap-3 sm:py-5',
              active
                ? 'border-brand-400 bg-brand-400 text-on-brand shadow-glow'
                : 'border-line bg-surface text-ink hover:border-brand-300 hover:shadow-soft',
            )}
          >
            <CategoryIcon
              category={id}
              className={cn(
                'size-6 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110',
                !active && 'text-ink/80',
              )}
              strokeWidth={active ? 2.4 : 1.8}
            />
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}
