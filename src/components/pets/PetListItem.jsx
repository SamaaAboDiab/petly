import { motion } from 'framer-motion';
import { ChevronRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import { petPhoto } from '@/lib/petPhoto';
import { formatPrice } from '@/lib/format';
import { PetAgeGender, PetLocation } from './PetMeta';

/** Horizontal pet row used in favorites and listings. */
export default function PetListItem({ pet, onUnfavorite }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
      className="group relative flex items-stretch gap-4 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
    >
      {/* Photo runs flush to the card's left edge, like the design. */}
      {/* The text sets the row height; the photo fills it whatever its own size. */}
      <div className="relative w-36 shrink-0 sm:w-40">
        <SmartImage
          src={petPhoto(pet.images[0], 0.9, 400)}
          alt={pet.name}
          className="absolute inset-0"
          imgClassName="transition-transform !duration-700 group-hover:scale-110"
        />
        {onUnfavorite && (
          <button
            type="button"
            onClick={() => onUnfavorite(pet)}
            aria-label={`Remove ${pet.name} from favorites`}
            className="focus-ring absolute right-2 top-2 z-20 grid size-7 place-items-center rounded-full bg-brand-400 text-white shadow-soft transition-transform hover:scale-110"
          >
            <Heart className="size-3.5 fill-current" />
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1 py-3.5">
        <h3 className="truncate font-bold text-ink">
          <Link to={`/app/pets/${pet.slug ?? pet.id}`} className="focus-ring rounded after:absolute after:inset-0 after:z-10">
            {pet.name}
          </Link>
        </h3>
        {pet.status === 'sold' && <p className="mt-1 text-xs font-semibold text-muted">Found a home</p>}
        <PetAgeGender pet={pet} withIcon className="mt-1.5" />
        <PetLocation location={pet.location} className="mt-1.5" />
        <p className="mt-2.5 text-lg font-extrabold text-brand-600 dark:text-brand-300">{formatPrice(pet.price)}</p>
      </div>
      <span className="mb-3.5 mr-3.5 grid size-8 shrink-0 place-items-center self-end rounded-full bg-brand-400 text-on-brand transition-transform duration-300 group-hover:translate-x-1">
        <ChevronRight className="size-4" strokeWidth={2.6} />
      </span>
    </motion.article>
  );
}
