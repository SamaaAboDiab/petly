import { motion } from 'framer-motion';
import { LogOut, PawPrint, Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { navItemsFor } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/cn';

export default function Sidebar({ onAddPet }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { unreadTotal } = useChat();
  const badges = { cart: itemCount, messages: unreadTotal };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-surface px-5 py-7 lg:flex">
      <Logo className="px-2" />

      <Button size="lg" block leftIcon={Plus} className="mt-8" onClick={onAddPet}>
        List a Pet
      </Button>

      <nav className="mt-8 flex flex-col gap-1.5" aria-label="Main">
        {navItemsFor(user).map(({ to, label, icon: Icon, end, badge, fillWhenActive }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'focus-ring group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors',
                isActive ? 'text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-brand-100 dark:bg-brand-400/15"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative size-5 transition-transform group-hover:scale-110',
                    isActive && 'text-brand-600 dark:text-brand-300',
                  )}
                  fill={isActive && fillWhenActive ? 'currentColor' : 'none'}
                />
                <span className="relative flex-1">{label}</span>
                {badges[badge] > 0 && (
                  <span className="relative rounded-full bg-brand-400 px-2 py-0.5 text-xs font-bold text-on-brand">{badges[badge]}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="on-brand relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-300 to-brand-400 p-5">
          <PawPrint className="absolute -right-4 -top-4 size-20 rotate-12 text-white/40" strokeWidth={1.5} />
          <p className="relative font-bold text-ink">Love Pets?</p>
          <p className="relative mt-1 text-xs text-ink/70">Join our community and get special offers & updates!</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="focus-ring flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        >
          <LogOut className="size-5" /> Log Out
        </button>
      </div>
    </aside>
  );
}
