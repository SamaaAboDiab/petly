import { BadgeCheck, Heart, MessageCircle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/layout/UserAvatar';
import { cn } from '@/lib/cn';

export default function SellerCard({ seller, onChat, isFavorite, onToggleFavorite, className }) {
  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 transition-all duration-300 hover:border-brand-200 hover:shadow-soft',
        className,
      )}
    >
      <Link to={`/app/sellers/${seller.id}`} className="focus-ring relative shrink-0 rounded-full" aria-label={`View ${seller.name}'s profile`}>
        <UserAvatar user={seller} className="size-14 ring-0" />
        {seller.verified && (
          <BadgeCheck className="absolute -bottom-1 -right-1 size-5 rounded-full bg-surface fill-brand-400 text-white" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/app/sellers/${seller.id}`}
          className="focus-ring block truncate rounded font-bold text-ink transition-colors hover:text-brand-600 dark:hover:text-brand-300"
        >
          {seller.name}
        </Link>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          {seller.verified ? 'Verified Seller' : 'Seller'}
          <span className="mx-1 size-1 rounded-full bg-muted/60" />
          <Star className="size-3 fill-brand-400 text-brand-400" /> {seller.rating ?? 'New'}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          Joined {seller.joined} • {seller.listings} listings
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Unfollow seller' : 'Follow seller'}
            className="focus-ring hidden size-10 place-items-center rounded-xl border border-line text-muted transition hover:border-rose-300 hover:text-rose-500 sm:grid"
          >
            <Heart className={cn('size-4', isFavorite && 'fill-rose-500 text-rose-500')} />
          </button>
        )}
        {onChat && (
          <button
            type="button"
            onClick={onChat}
            className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border-2 border-brand-400 px-4 text-sm font-semibold text-ink transition hover:bg-brand-400 hover:text-on-brand"
          >
            <MessageCircle className="size-4" /> Chat
          </button>
        )}
      </div>
    </div>
  );
}
