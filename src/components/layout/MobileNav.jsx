import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/cn';

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'focus-ring relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-semibold transition-colors',
          isActive ? 'text-brand-600 dark:text-brand-300' : 'text-muted',
        )
      }
    >
      {({ isActive }) => (
        <>
          <motion.span animate={{ y: isActive ? -2 : 0, scale: isActive ? 1.1 : 1 }}>
            <Icon className="size-5" fill={isActive ? 'currentColor' : 'none'} fillOpacity={0.25} />
          </motion.span>
          {label}
        </>
      )}
    </NavLink>
  );
}

export default function MobileNav({ onAddPet }) {
  const [left, right] = [MOBILE_NAV_ITEMS.slice(0, 2), MOBILE_NAV_ITEMS.slice(2)];
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-18 max-w-lg items-center px-3">
        {left.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <div className="flex flex-1 justify-center">
          <motion.button
            type="button"
            onClick={onAddPet}
            aria-label="List a pet"
            whileTap={{ scale: 0.9, rotate: 90 }}
            className="focus-ring -mt-8 grid size-15 place-items-center rounded-full bg-brand-400 text-on-brand shadow-glow ring-8 ring-canvas"
          >
            <Plus className="size-7" strokeWidth={2.6} />
          </motion.button>
        </div>
        {right.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
