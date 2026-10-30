import { motion } from 'framer-motion';
import {
  Headphones,
  Heart,
  LogOut,
  MapPin,
  MessageSquareText,
  Moon,
  Package,
  PawPrint,
  Pencil,
  Settings,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { STATUS_BADGE } from '@/components/orders/OrderCard';
import UserAvatar from '@/components/layout/UserAvatar';
import PetGrid from '@/components/pets/PetGrid';
import PromoBanner from '@/components/pets/PromoBanner';
import MenuItem from '@/components/profile/MenuItem';
import StatCard from '@/components/profile/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';
import SmartImage from '@/components/ui/SmartImage';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useChat } from '@/context/ChatContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { useAsync } from '@/hooks/useAsync';
import { cn } from '@/lib/cn';
import { formatPrice, pluralize } from '@/lib/format';
import { petService } from '@/services/petService';

function ThemeSwitch({ on }) {
  return (
    <span className={cn('flex h-7 w-12 items-center rounded-full p-1 transition-colors', on ? 'bg-brand-400' : 'bg-line')}>
      <motion.span layout className={cn('size-5 rounded-full bg-white shadow', on && 'ml-auto')} />
    </span>
  );
}

function OrderRow({ order }) {
  const status = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  return (
    <li className="relative flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 transition hover:shadow-soft">
      <Link to="/app/orders" aria-label={`Order ${order.orderNumber}`} className="focus-ring absolute inset-0 rounded-2xl" />
      <div className="flex -space-x-3">
        {order.items.slice(0, 3).map((item, index) => (
          <SmartImage key={index} src={item.image} alt={item.name} className="size-11 rounded-full ring-2 ring-surface" />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">#{order.orderNumber}</p>
        <p className="text-xs text-muted">
          {pluralize(order.items.length, 'pet')} • {new Date(order.createdAt).toLocaleDateString('en-GB')}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold text-ink">{formatPrice(order.total)}</p>
        <Badge variant={status.variant} className="mt-1 px-2 py-0.5 text-[10px]">
          {status.label}
        </Badge>
      </div>
    </li>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { orders } = useCart();
  const { pets: favoritePets } = useFavorites();
  const { unreadTotal } = useChat();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const listings = useAsync(() => petService.getMyListings(), []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const menu = [
    { icon: Package, label: 'My Orders', onClick: () => navigate('/app/orders') },
    { icon: Tag, label: 'My Listings', onClick: () => scrollTo('listings') },
    { icon: Heart, label: 'Favorites', onClick: () => navigate('/app/favorites') },
    { icon: MessageSquareText, label: 'Messages', badge: unreadTotal, onClick: () => navigate('/app/messages') },
    { icon: Headphones, label: 'Help & Support', onClick: () => navigate('/app/help') },
    { icon: Moon, label: 'Dark mode', onClick: toggleTheme, trailing: <ThemeSwitch on={isDark} /> },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/app/settings') },
    ...(user?.role === 'admin' ? [{ icon: ShieldCheck, label: 'Admin dashboard', onClick: () => navigate('/app/admin') }] : []),
  ];

  return (
    <PageTransition className="grid items-start gap-8 lg:grid-cols-[400px_1fr]">
      {/* Left column — identity + menu */}
      <div className="space-y-5 lg:sticky lg:top-28">
        <section className="relative overflow-hidden rounded-[2rem] border border-line bg-surface shadow-soft">
          <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-32 w-full" aria-hidden>
            <path d="M0 0h400v90c-60 40-120 50-200 20S60 80 0 120z" className="fill-brand-400" />
          </svg>
          <div className="relative px-6 pb-6 pt-14">
            <div className="relative w-fit">
              <UserAvatar user={user} className="size-24 text-3xl ring-[6px]" />
              <button
                type="button"
                onClick={() => navigate('/app/settings')}
                aria-label="Edit profile"
                className="focus-ring absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-surface text-ink shadow-soft transition hover:scale-110 hover:bg-brand-100"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-ink">{user?.name}</h1>
            <p className="text-sm text-muted">{user?.email}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-4" /> {user?.location ?? 'Cairo, Egypt'}
            </p>

            <div className="mt-5 flex divide-x divide-line rounded-2xl border border-line">
              <StatCard value={listings.data?.length ?? 0} label="Listings" />
              <StatCard value={favoritePets.length} label="Favorites" />
              <StatCard value={orders.length} label="Purchases" />
            </div>
          </div>
        </section>

        <PromoBanner
          title="Love Pets?"
          description="Join our community and get special offers & updates!"
          icon={PawPrint}
          to="/app/categories"
        />

        <nav className="rounded-[2rem] border border-line bg-surface p-2 shadow-soft">
          {menu.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="focus-ring flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-surface-2 text-sm font-semibold text-ink transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        >
          <LogOut className="size-4" /> Log Out
        </button>
      </div>

      {/* Right column — activity */}
      <div className="space-y-12">
        <section id="orders" className="scroll-mt-28">
          <SectionHeader title="Recent orders" subtitle="Your adoption history" />
          {orders.length === 0 ? (
            <EmptyState icon={Package} title="No orders yet" description="When you check out, your orders will appear here." />
          ) : (
            <ul className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          )}
        </section>

        <section id="listings" className="scroll-mt-28">
          <SectionHeader title="My listings" subtitle="Pets you’ve put up for adoption" />
          {!listings.loading && listings.data?.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No listings yet"
              description="Use the “+” button to list your first pet in under a minute."
            />
          ) : (
            <PetGrid pets={listings.data} loading={listings.loading} skeletonCount={3} className="xl:grid-cols-3" />
          )}
        </section>
      </div>
    </PageTransition>
  );
}
