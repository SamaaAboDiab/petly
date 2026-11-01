import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

export default function CategoryCard({ category, active, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(category.id)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
      className={cn(
        'focus-ring group overflow-hidden rounded-3xl border bg-surface p-1.5 text-left shadow-soft transition-all duration-300 hover:shadow-lift sm:p-2',
        active ? 'border-brand-400 ring-4 ring-brand-300/40' : 'border-line',
      )}
    >
      <SmartImage
        src={category.cover}
        alt={category.label}
        className="aspect-[4/4.6] rounded-2xl bg-brand-100 sm:aspect-[4/3]"
        imgClassName="transition-transform !duration-700 group-hover:scale-110"
      />
      <div className="flex items-end justify-between gap-1 px-1 pb-1 pt-2.5 sm:items-center sm:px-2 sm:pb-1.5 sm:pt-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink sm:text-base">{category.label}</p>
          <p className="text-[11px] text-muted sm:text-xs">{category.count}+ pets</p>
        </div>
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-400 text-on-brand transition-transform duration-300 group-hover:translate-x-1 sm:size-8">
          <ChevronRight className="size-4" strokeWidth={2.6} />
        </span>
      </div>
    </motion.button>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-2">
      <Skeleton className="aspect-[4/3]" rounded="rounded-2xl" />
      <div className="flex items-center justify-between px-2 pb-1.5 pt-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="size-8" rounded="rounded-full" />
      </div>
    </div>
  );
}
