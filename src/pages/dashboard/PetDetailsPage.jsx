import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  HeartHandshake,
  Mars,
  Pencil,
  MessageCircle,
  SearchX,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Timer,
  Trash2,
  Venus,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import AddPetModal from '@/components/pets/AddPetModal';
import CategoryIcon from '@/components/pets/CategoryIcon';
import FavoriteButton from '@/components/pets/FavoriteButton';
import HealthFeatures from '@/components/pets/HealthFeatures';
import PetGallery, { GalleryThumbs, useGallery } from '@/components/pets/PetGallery';
import PetGrid from '@/components/pets/PetGrid';
import SellerCard from '@/components/pets/SellerCard';
import Badge from '@/components/ui/Badge';
import Button, { buttonStyles } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import IconButton from '@/components/ui/IconButton';
import Modal from '@/components/ui/Modal';
import SectionHeader from '@/components/ui/SectionHeader';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { CATEGORIES } from '@/data/pets';
import { useAsync } from '@/hooks/useAsync';
import { usePetActions } from '@/hooks/usePetActions';
import { useStartChat } from '@/hooks/useStartChat';
import { formatPrice } from '@/lib/format';
import { petService } from '@/services/petService';

function DetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <Skeleton className="aspect-[4/3.2]" rounded="rounded-[2rem]" />
        <div className="mt-4 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/3]" rounded="rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24" rounded="rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 w-full" rounded="rounded-3xl" />
        <Skeleton className="h-13 w-full" rounded="rounded-2xl" />
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted">
      <Icon className="size-4 text-ink/70" /> {children}
    </span>
  );
}

export default function PetDetailsPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isInCart } = useCart();
  const { isSellerFavorite, toggleSeller } = useFavorites();
  const { addToCart, toggleFavorite, isFavorite } = usePetActions();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => petService.getPetById(petId), [petId]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const { openChat, starting: openingChat } = useStartChat();
  // Lifted so the thumbnails can sit under the seller card on mobile (as in the design).
  const gallery = useGallery(data?.pet.images.length ?? 1);
  const { goTo } = gallery;
  useEffect(() => goTo(0), [petId, goTo]);

  if (loading) return <DetailsSkeleton />;

  if (error || !data) {
    return (
      <EmptyState
        icon={SearchX}
        title="We couldn’t find this pet"
        description="It may have already found a loving home"
        action={
          <Link to="/app" className={buttonStyles()}>
            Back to home
          </Link>
        }
      />
    );
  }

  const { pet, seller, related } = data;
  const inCart = isInCart(pet.id);
  const isOwner = Boolean(user) && pet.sellerId === user.id;
  const sold = pet.status === 'sold';
  const categoryLabel = CATEGORIES.find((c) => c.id === pet.category)?.singular;

  // A renamed pet gets a new slug — keep the URL in sync.
  const handleSaved = (updated) => {
    if (updated.slug && updated.slug !== petId) navigate(`/app/pets/${updated.slug}`, { replace: true });
    else reload();
  };

  const deleteListing = async () => {
    setDeleting(true);
    try {
      await petService.deletePet(pet.id);
      toast({ title: 'Listing deleted', description: pet.name, variant: 'info' });
      navigate('/app/profile', { replace: true });
    } catch (err) {
      toast({ title: 'Couldn’t delete listing', description: err.message, variant: 'error' });
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: pet.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied', description: 'Share it with a friend', variant: 'info' });
      }
    } catch {
      /* user cancelled share sheet */
    }
  };

  const contactSeller = () => openChat({ sellerId: seller.id, petId: pet.id });

  return (
    <PageTransition className="space-y-14">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="focus-ring group mb-6 hidden items-center gap-2 rounded-xl text-sm font-semibold text-muted transition hover:text-ink lg:inline-flex"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12">
          {/* Mobile: edge-to-edge photo with back/favorite/share on top, like the design. */}
          <PetGallery
            images={pet.images}
            name={pet.name}
            gallery={gallery}
            frameClassName="max-lg:-mx-4 max-lg:aspect-[4/3.3] max-lg:rounded-none max-lg:rounded-b-[2rem] max-lg:shadow-none"
            thumbsClassName="hidden lg:block"
          >
            <IconButton
              icon={ArrowLeft}
              label="Back"
              variant="glass"
              size="sm"
              className="absolute left-4 top-4 size-10 lg:hidden"
              onClick={() => navigate(-1)}
            />
            <div className="absolute right-4 top-4 flex gap-2">
              <FavoriteButton active={isFavorite(pet.id)} onToggle={() => toggleFavorite(pet)} />
              <IconButton icon={Share2} label="Share" variant="glass" size="sm" className="size-10" onClick={share} />
            </div>
          </PetGallery>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{pet.name}</h1>
              {sold ? <Badge variant="neutral">Sold</Badge> : pet.popular && <Badge>Popular</Badge>}
              {isOwner && <Badge variant="neutral">Your listing</Badge>}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <MetaItem icon={(props) => <CategoryIcon category={pet.category} {...props} />}>{categoryLabel}</MetaItem>
              <MetaItem icon={Timer}>{pet.age}</MetaItem>
              <MetaItem icon={pet.gender === 'Male' ? Mars : Venus}>{pet.gender}</MetaItem>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-6">
              <p className="text-3xl font-extrabold text-ink">{formatPrice(pet.price)}</p>
              {pet.features.healthCheck && (
                <Badge variant="success" icon={ShieldCheck} className="px-4 py-2 text-sm">
                  Health Checked
                </Badge>
              )}
            </div>

            <h2 className="mt-6 font-bold text-ink">About This Pet</h2>
            <p className="mt-2 leading-relaxed text-muted">{pet.description}</p>

            <div className="mt-6">
              <HealthFeatures features={pet.features} />
            </div>

            {seller && (
              <SellerCard
                seller={seller}
                onChat={isOwner ? undefined : contactSeller}
                isFavorite={isSellerFavorite(seller.id)}
                onToggleFavorite={isOwner ? undefined : () => toggleSeller(seller)}
                className="mt-6"
              />
            )}

            <GalleryThumbs images={pet.images} gallery={gallery} className="mt-6 lg:hidden" />

            {sold && (
              <p className="mt-6 flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm font-semibold text-ink">
                <HeartHandshake className="size-5 text-brand-500" />
                {isOwner ? 'This pet has been sold.' : 'This pet has already found a loving home.'}
              </p>
            )}

            {/* Mobile: these actions live in the sticky bar at the bottom of the screen. */}
            <div className="mt-6 hidden gap-3 sm:grid-cols-2 lg:grid">
              {isOwner ? (
                <>
                  <Button size="lg" leftIcon={Pencil} onClick={() => setEditing(true)} disabled={sold}>
                    Edit listing
                  </Button>
                  <Button size="lg" variant="secondary" leftIcon={Trash2} onClick={() => setConfirmDelete(true)} className="hover:border-red-300 hover:text-red-500">
                    Delete listing
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    leftIcon={inCart ? Check : ShoppingBag}
                    disabled={sold}
                    onClick={() => (inCart ? navigate('/app/cart') : addToCart(pet))}
                  >
                    {sold ? 'Already adopted' : inCart ? 'In cart — view' : 'Add to Cart'}
                  </Button>
                  <Button size="lg" variant="dark" leftIcon={MessageCircle} onClick={contactSeller} loading={openingChat} disabled={!seller}>
                    Contact Seller
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile sticky action bar (the bottom nav is hidden on this page). */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        {isOwner ? (
          <div className="flex gap-3">
            <IconButton icon={Trash2} label="Delete listing" onClick={() => setConfirmDelete(true)} className="size-13 rounded-2xl hover:text-red-500" />
            <Button size="lg" block leftIcon={Pencil} onClick={() => setEditing(true)} disabled={sold}>
              {sold ? 'Sold' : 'Edit listing'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <IconButton
              icon={inCart ? Check : ShoppingBag}
              label={sold ? 'Already adopted' : inCart ? 'View cart' : 'Add to cart'}
              disabled={sold}
              onClick={() => (inCart ? navigate('/app/cart') : addToCart(pet))}
              className="size-13 rounded-2xl disabled:opacity-40"
            />
            <Button size="lg" block leftIcon={MessageCircle} onClick={contactSeller} loading={openingChat} disabled={!seller}>
              Contact Seller
            </Button>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section>
          <SectionHeader title="You may also like" to={`/app/categories?type=${pet.category}`} />
          <PetGrid pets={related} />
        </section>
      )}

      {isOwner && <AddPetModal open={editing} onClose={() => setEditing(false)} pet={pet} onSaved={handleSaved} />}

      <Modal open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} title="Delete listing" className="max-w-sm">
        <div className="p-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <Trash2 className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">Delete “{pet.name}”?</h2>
          <p className="mt-1 text-sm text-muted">This removes the listing for everyone. It can’t be undone.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={deleteListing} loading={deleting} className="bg-red-500 text-white shadow-none hover:bg-red-600">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
