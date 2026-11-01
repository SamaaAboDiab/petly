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

export default function DashboardLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [addPetOpen, setAddPetOpen] = useState(false);
  const { pathname } = useLocation();

  useHotkey('k', () => setSearchOpen((open) => !open));

  const openAddPet = () => setAddPetOpen(true);

  return (
    <div className="min-h-dvh">
      <Sidebar onAddPet={openAddPet} />

      <div className="lg:pl-72">
        <Topbar onOpenSearch={() => setSearchOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 pb-32 pt-2 sm:px-6 lg:px-10 lg:pb-16">
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <MobileNav onAddPet={openAddPet} />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AddPetModal open={addPetOpen} onClose={() => setAddPetOpen(false)} />
    </div>
  );
}
