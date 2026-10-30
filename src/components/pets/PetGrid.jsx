import { AnimatePresence, motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import PetCard from './PetCard';
import PetCardSkeleton from './PetCardSkeleton';

const GRID = 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 sm:gap-5';

export default function PetGrid({ pets, loading, skeletonCount = 8, emptyAction, className }) {
  if (loading) {
    return (
      <div className={cn(GRID, className)}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <PetCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!pets?.length) {
    return (
      <EmptyState
        icon={SearchX}
        title="No pets found"
        description="Try another category or a different search term."
        action={emptyAction}
      />
    );
  }

  return (
    <motion.div layout className={cn(GRID, className)}>
      <AnimatePresence mode="popLayout">
        {pets.map((pet, index) => (
          <motion.div
            key={pet.id}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
          >
            <PetCard pet={pet} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
