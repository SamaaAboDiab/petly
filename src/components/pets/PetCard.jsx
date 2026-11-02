import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/ui/Badge';
import SmartImage from '@/components/ui/SmartImage';
import { petPhoto } from '@/lib/petPhoto';
import { useAuth } from '@/context/AuthContext';
import { usePetActions } from '@/hooks/usePetActions';
import { formatPrice } from '@/lib/format';
import FavoriteButton from './FavoriteButton';
import { PetAgeGender, PetLocation } from './PetMeta';

const TILT = 7;
const SPRING = { stiffness: 220, damping: 22 };

/** Pet card with 3D tilt + light glare that follows the cursor (mouse only). */
export default function PetCard({ pet }) {
  const { addToCart, toggleFavorite, isFavorite } = usePetActions();
  const { user } = useAuth();
  const sold = pet.status === 'sold';
  // Your own listings and sold pets can't go in the cart.
  const canBuy = !sold && pet.sellerId !== user?.id;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [TILT, -TILT]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT, TILT]), SPRING);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgb(255 255 255 / 0.35), transparent 55%)`;

  const handlePointerMove = (event) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const resetTilt = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-2.5 shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative">
        <SmartImage
          src={petPhoto(pet.images[0], 4 / 3.4)}
          alt={pet.name}
          className="aspect-[4/3.4] rounded-2xl"
          imgClassName="group-hover:scale-110 !duration-700"
        />
        {sold ? (
          <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/40">
            <Badge variant="neutral" className="bg-white text-ink shadow-soft">
              Found a home
            </Badge>
          </span>
        ) : (
          pet.popular && (
            <Badge variant="solid" className="absolute bottom-3 left-3 shadow-soft">
              Popular
            </Badge>
          )
        )}
        <FavoriteButton
          size="sm"
          active={isFavorite(pet.id)}
          onToggle={() => toggleFavorite(pet)}
          className="absolute right-3 top-3 z-20"
        />
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-bold text-ink">
            {/* Stretched link: the whole card is clickable without nesting buttons in <a>. */}
            <Link to={`/app/pets/${pet.slug ?? pet.id}`} className="focus-ring rounded after:absolute after:inset-0 after:z-10">
              {pet.name}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-muted">
            <Star className="size-3.5 fill-brand-400 text-brand-400" />
            {pet.rating}
          </span>
        </div>
        <PetAgeGender pet={pet} className="mt-1" />
        <PetLocation location={pet.location} className="mt-1.5" />

        <div className="mt-3 flex items-center justify-between">
          <p className={sold ? 'text-lg font-extrabold text-muted line-through' : 'text-lg font-extrabold text-brand-600 dark:text-brand-300'}>
            {formatPrice(pet.price)}
          </p>
          {canBuy && (
          <motion.button
            type="button"
            aria-label={`Add ${pet.name} to cart`}
            onClick={() => addToCart(pet)}
            whileTap={{ scale: 0.85, rotate: 90 }}
            className="focus-ring relative z-20 grid size-9 place-items-center rounded-xl bg-brand-400 text-on-brand shadow-glow transition-all duration-300 hover:bg-brand-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
          >
            <Plus className="size-5" strokeWidth={2.6} />
          </motion.button>
          )}
        </div>
      </div>

      <motion.div
        aria-hidden
        style={{ background: glare }}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
    </motion.article>
  );
}
