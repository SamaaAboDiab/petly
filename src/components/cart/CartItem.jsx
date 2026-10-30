import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PetAgeGender, PetLocation } from '@/components/pets/PetMeta';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import SmartImage from '@/components/ui/SmartImage';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';

export default function CartItem({ item }) {
  const { removeItem, toggleSelected } = useCart();
  const { pet, selected, sold } = item;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
      className={cn(
        'group relative flex items-center gap-3 rounded-3xl border bg-surface p-3 pr-12 transition-all duration-300 hover:shadow-soft sm:gap-4 sm:p-4 sm:pr-12',
        selected ? 'border-line' : 'border-dashed border-line',
        sold && 'opacity-60',
      )}
    >
      {sold ? (
        <span className="size-6 shrink-0" aria-hidden />
      ) : (
        <Checkbox round checked={selected} onChange={() => toggleSelected(pet.id)} ariaLabel={`Select ${pet.name}`} />
      )}

      <Link to={`/app/pets/${pet.slug ?? pet.id}`} className="focus-ring shrink-0 rounded-2xl">
        <SmartImage
          src={pet.images[0]}
          alt={pet.name}
          className={cn('size-20 rounded-2xl sm:size-24', sold && 'grayscale')}
          imgClassName="transition-transform !duration-500 group-hover:scale-110"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-bold text-ink">{pet.name}</p>
          {sold && <Badge variant="neutral">Already adopted</Badge>}
        </div>
        <PetAgeGender pet={pet} className="mt-1" />
        <PetLocation location={pet.location} className="mt-1" />
        <p className={cn('mt-2 font-extrabold text-ink', sold && 'line-through')}>{formatPrice(pet.price)}</p>
      </div>

      <button
        type="button"
        onClick={() => removeItem(pet.id)}
        aria-label={`Remove ${pet.name}`}
        className="focus-ring absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted transition hover:rotate-90 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
      >
        <X className="size-4" />
      </button>
    </motion.li>
  );
}
