import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, CalendarDays, Heart, MapPin, MessageCircle, PawPrint, Star, UserX } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import UserAvatar from '@/components/layout/UserAvatar';
import PetGrid from '@/components/pets/PetGrid';
import Button, { buttonStyles } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAsync } from '@/hooks/useAsync';
import { useStartChat } from '@/hooks/useStartChat';
import { cn } from '@/lib/cn';
import { petService } from '@/services/petService';

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
      <Icon className="size-5 text-brand-500" />
      <div>
        <p className="font-extrabold tabular-nums text-ink">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

export default function SellerPage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSellerFavorite, toggleSeller } = useFavorites();
  const { openChat, starting } = useStartChat();
  const { data, loading, error } = useAsync(() => petService.getSeller(sellerId), [sellerId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-56" rounded="rounded-[2rem]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-[4/5]" rounded="rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={UserX}
        title="Seller not found"
        description="This account may have been removed."
        action={
          <Link to="/app" className={buttonStyles()}>
            Back to home
          </Link>
        }
      />
    );
  }

  const { seller, pets } = data;
  const isMe = user?.id === seller.id;
  const following = isSellerFavorite(seller.id);

  return (
    <PageTransition className="space-y-10">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="focus-ring group mb-6 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back
        </button>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand-300/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <UserAvatar user={seller} className="size-24 text-3xl ring-4 ring-brand-200 dark:ring-brand-400/30" />
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-extrabold tracking-tight text-ink">
                {seller.name}
                {seller.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-400/15 dark:text-brand-300">
                    <BadgeCheck className="size-4" /> Verified seller
                  </span>
                )}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                {seller.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" /> {seller.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-4" /> Member since {seller.joined}
                </span>
              </p>
            </div>
            {isMe ? (
              <Link to="/app/settings" className={buttonStyles({ variant: 'secondary' })}>
                Edit profile
              </Link>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  leftIcon={Heart}
                  onClick={() => toggleSeller(seller)}
                  className={cn(following && 'border-rose-200 text-rose-500 [&_svg]:fill-current')}
                >
                  {following ? 'Following' : 'Follow'}
                </Button>
                <Button leftIcon={MessageCircle} loading={starting} onClick={() => openChat({ sellerId: seller.id })}>
                  Message
                </Button>
              </div>
            )}
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat icon={PawPrint} value={pets.length} label="For sale" />
            <Stat icon={Heart} value={seller.soldCount} label="Found homes" />
            <Stat icon={Star} value={seller.rating ?? 'New'} label="Avg. rating" />
          </div>
        </motion.section>
      </div>

      <section>
        <SectionHeader title={isMe ? 'Your pets for sale' : `Pets from ${seller.name.split(' ')[0]}`} />
        {pets.length === 0 ? (
          <EmptyState icon={PawPrint} title="Nothing for sale right now" description="Follow this seller to hear about new listings." />
        ) : (
          <PetGrid pets={pets} />
        )}
      </section>
    </PageTransition>
  );
}
