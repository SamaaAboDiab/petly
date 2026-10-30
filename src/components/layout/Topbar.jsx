import { ChevronDown, Hand, MapPin, MessageCircle, Moon, Search, ShoppingBag, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconButton from '@/components/ui/IconButton';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useChat } from '@/context/ChatContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/cn';
import NotificationBell from './NotificationBell';
import UserAvatar from './UserAvatar';

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

export default function Topbar({ onOpenSearch }) {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { unreadTotal } = useChat();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 transition-all duration-300',
        scrolled ? 'border-b border-line bg-canvas/80 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Logo className="lg:hidden" withTagline={false} />

        <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              Welcome back <Hand className="size-4 text-brand-500" />
            </p>
            <p className="truncate text-lg font-bold text-ink">{user?.name}</p>
          </div>
          <button
            type="button"
            className="focus-ring ml-4 flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm text-muted transition hover:text-ink"
          >
            <MapPin className="size-4 text-brand-500" /> {user?.location ?? 'Cairo, Egypt'}
            <ChevronDown className="size-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSearch}
            className="focus-ring hidden h-11 w-64 items-center gap-2 rounded-2xl border border-line bg-surface px-4 text-sm text-muted transition hover:border-brand-300 md:flex xl:w-80"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search pets, breeds…</span>
            <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>
          </button>
          <IconButton icon={Search} label="Search" onClick={onOpenSearch} className="md:hidden" />
          <IconButton
            icon={isDark ? Sun : Moon}
            label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className="hidden sm:inline-grid"
            iconClassName="transition-transform duration-500 hover:rotate-45"
          />
          <NotificationBell />
          <IconButton icon={MessageCircle} label="Messages" badge={unreadTotal} onClick={() => navigate('/app/messages')} className="lg:hidden" />
          <IconButton icon={ShoppingBag} label="Cart" badge={itemCount} onClick={() => navigate('/app/cart')} />
          <Link to="/app/profile" aria-label="Profile" className="focus-ring hidden rounded-full lg:block">
            <UserAvatar user={user} className="ring-2 transition hover:ring-brand-300" />
          </Link>
        </div>
      </div>
    </header>
  );
}
