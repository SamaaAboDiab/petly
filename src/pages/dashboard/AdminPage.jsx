import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AdminListings from '@/components/admin/AdminListings';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminTickets from '@/components/admin/AdminTickets';
import AdminUsers from '@/components/admin/AdminUsers';
import PageTransition from '@/components/layout/PageTransition';
import SegmentedControl from '@/components/ui/SegmentedControl';

const TABS = [
  { value: 'overview', label: 'Overview', Component: AdminOverview },
  { value: 'users', label: 'Users', Component: AdminUsers },
  { value: 'listings', label: 'Listings', Component: AdminListings },
  { value: 'orders', label: 'Orders', Component: AdminOrders },
  { value: 'support', label: 'Support', Component: AdminTickets },
];

export default function AdminPage() {
  // The tab lives in the URL so a refresh or shared link keeps it.
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((t) => t.value === params.get('tab')) ?? TABS[0];

  return (
    <PageTransition>
      <div className="mb-6 flex items-center gap-3">
        <span className="on-brand grid size-12 place-items-center rounded-2xl bg-brand-400 text-ink shadow-glow">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Admin</h1>
          <p className="text-muted">Manage users, listings, orders and support.</p>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <SegmentedControl
          value={tab.value}
          onChange={(value) => setParams(value === 'overview' ? {} : { tab: value }, { replace: true })}
          className="min-w-[520px] max-w-2xl"
          options={TABS.map(({ value, label }) => ({ value, label }))}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab.value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <tab.Component />
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  );
}
