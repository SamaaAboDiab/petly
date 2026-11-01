import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CommandPalette from '@/components/layout/CommandPalette';
import MobileNav from '@/components/layout/MobileNav';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import AddPetModal from '@/components/pets/AddPetModal';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import PageLoader from '@/components/feedback/PageLoader';
import { useHotkey } from '@/hooks/useHotkey';
import { cn } from '@/lib/cn';

// Mobile layouts from the design: these pages draw their own header...
const NO_TOPBAR_ROUTES = /^\/app\/(pets\/[^/]+|cart|profile|favorites)\/?$/;
// ...and these also hide the bottom nav (they have a sticky action instead).
const IMMERSIVE_ROUTES = /^\/app\/(pets\/[^/]+|cart)\/?$/;

export default function DashboardLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const { pathname } = useLocation();
  const immersive = IMMERSIVE_ROUTES.test(pathname);
  const noTopbar = NO_TOPBAR_ROUTES.test(pathname);

  useHotkey('k', () => setSearchOpen((open) => !open));

  const openAddPet = () => setAddPetOpen(true);

  return (
    <div className="min-h-dvh">
      <Sidebar onAddPet={openAddPet} />

      <div className="lg:pl-72">
        <Topbar onOpenSearch={() => setSearchOpen(true)} hideOnMobile={noTopbar} />
        <main
          className={cn(
            'mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-10 lg:pb-16',
            immersive ? 'pb-28' : 'pb-32',
            noTopbar && (immersive ? 'max-lg:pt-0' : 'max-lg:pt-4'),
          )}
        >
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {!immersive && <MobileNav onAddPet={openAddPet} />}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AddPetModal open={addPetOpen} onClose={() => setAddPetOpen(false)} />
    </div>
  );
}
