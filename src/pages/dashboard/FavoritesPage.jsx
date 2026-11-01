import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import PetListItem from '@/components/pets/PetListItem';
import SellerCard from '@/components/pets/SellerCard';
import { buttonStyles } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import IconButton from '@/components/ui/IconButton';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { usePetActions } from '@/hooks/usePetActions';
import { useStartChat } from '@/hooks/useStartChat';

export default function FavoritesPage() {
  const { pets, sellers, toggleSeller, clear } = useFavorites();
  const { toggleFavorite } = usePetActions();
  const { openChat } = useStartChat();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('pets');

  const currentCount = tab === 'pets' ? pets.length : sellers.length;

  const handleClear = () => {
    clear(tab);
    toast({ title: `Cleared favorite ${tab}`, variant: 'info' });
  };

  return (
    <PageTransition>
      {/* Mobile header from the design: back · title · clear. */}
      <div className="mb-4 grid h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center lg:hidden">
        <IconButton icon={ArrowLeft} label="Back" variant="ghost" onClick={() => navigate(-1)} />
        <h1 className="text-center text-xl font-bold text-ink">My Favorites</h1>
        {currentCount > 0 && <IconButton icon={Trash2} label={`Clear favorite ${tab}`} variant="ghost" onClick={handleClear} />}
      </div>

      <div className="mb-8 hidden items-center justify-between lg:flex">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">My Favorites</h1>
          <p className="mt-1 text-muted">Pets and sellers you love, all in one place.</p>
        </div>
        {currentCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={`Clear favorite ${tab}`}
            className="focus-ring grid size-11 place-items-center rounded-full border border-line bg-surface text-muted transition hover:border-red-200 hover:text-red-500"
          >
            <Trash2 className="size-5" />
          </button>
        )}
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        className="mb-6 max-w-md lg:mb-8"
        options={[
          { value: 'pets', label: 'Pets', count: pets.length },
          { value: 'sellers', label: 'Sellers', count: sellers.length },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: tab === 'pets' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tab === 'pets' ? 20 : -20 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'pets' &&
            (pets.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No favorite pets yet"
                description="Tap the heart on any pet to save it here."
                action={
                  <Link to="/app/categories" className={buttonStyles()}>
                    Discover pets
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {pets.map((pet) => (
                    <PetListItem key={pet.id} pet={pet} onUnfavorite={toggleFavorite} />
                  ))}
                </AnimatePresence>
              </div>
            ))}

          {tab === 'sellers' &&
            (sellers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No favorite sellers yet"
                description="Follow sellers from any pet page to keep up with new listings."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sellers.map((seller) => (
                  <SellerCard
                    key={seller.id}
                    seller={seller}
                    isFavorite
                    onToggleFavorite={() => toggleSeller(seller)}
                    onChat={() => openChat({ sellerId: seller.id })}
                  />
                ))}
              </div>
            ))}
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  );
}
