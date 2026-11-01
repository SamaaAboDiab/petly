import { AnimatePresence, motion } from 'framer-motion';
import { SearchX } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import PetCard from './PetCard';
import PetCardSkeleton from './PetCardSkeleton';

const GRID = 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 sm:gap-5';
// Phones: one swipeable row (≈2 cards visible) like the mobile design; grid from `sm` up.
const CAROUSEL =
  'no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 xl:grid-cols-4';
const CAROUSEL_ITEM = 'w-[44%] shrink-0 snap-start sm:w-auto';

/** `mobileCarousel`: render as a horizontal swipe row on phones. */
export default function PetGrid({ pets, loading, skeletonCount = 8, emptyAction, mobileCarousel = false, className }) {
  const layout = mobileCarousel ? CAROUSEL : GRID;
  const item = mobileCarousel ? CAROUSEL_ITEM : undefined;

  if (loading) {
    return (
      <div className={cn(layout, className)}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className={item}>
            <PetCardSkeleton />
          </div>
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
    <motion.div layout className={cn(layout, className)}>
      <AnimatePresence mode="popLayout">
        {pets.map((pet, index) => (
          <motion.div
            key={pet.id}
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
            className={item}
          >
            <PetCard pet={pet} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
