import { AnimatePresence } from 'framer-motion';
import { Package, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import OrderCard from '@/components/orders/OrderCard';
import { buttonStyles } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Skeleton from '@/components/ui/Skeleton';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useStartChat } from '@/hooks/useStartChat';
import { orderService } from '@/services/orderService';

const CONFIRM_MESSAGES = {
  confirmed: 'Order confirmed — the buyer has been notified',
  delivered: 'Marked as delivered',
  cancelled: 'Order cancelled — the pet is listed again',
};

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'sales' ? 'sales' : 'purchases';
  const { orders: purchases, replaceOrder } = useCart();
  const toast = useToast();
  const { openChat } = useStartChat();
  const [sales, setSales] = useState(null);

  // Sales are loaded on demand and kept locally so status changes show instantly.
  useEffect(() => {
    if (tab !== 'sales') return;
    let cancelled = false;
    orderService
      .sales()
      .then((list) => !cancelled && setSales(list))
      .catch(() => !cancelled && setSales([]));
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const changeStatus = async (order, status) => {
    try {
      const updated = await orderService.updateStatus(order.id, status);
      if (tab === 'sales') setSales((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      else replaceOrder(updated);
      toast({ title: CONFIRM_MESSAGES[status], description: `Order #${updated.orderNumber}` });
    } catch (error) {
      toast({ title: 'Couldn’t update order', description: error.message, variant: 'error' });
    }
  };

  const list = tab === 'sales' ? sales : purchases;
  const role = tab === 'sales' ? 'seller' : 'buyer';

  return (
    <PageTransition>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Orders</h1>
      <p className="mt-1 text-muted">Track what you bought and manage what you sold.</p>

      <SegmentedControl
        value={tab}
        onChange={(value) => setParams(value === 'sales' ? { tab: 'sales' } : {}, { replace: true })}
        className="my-6 max-w-sm"
        options={[
          { value: 'purchases', label: 'Purchases', count: purchases.length },
          { value: 'sales', label: 'Sales', count: sales?.length },
        ]}
      />

      {list === null ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" rounded="rounded-3xl" />
          <Skeleton className="h-80" rounded="rounded-3xl" />
        </div>
      ) : list.length === 0 ? (
        tab === 'sales' ? (
          <EmptyState icon={Tag} title="No sales yet" description="When someone orders one of your pets, it shows up here for you to confirm." />
        ) : (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Pets you adopt will appear here with their delivery status."
            action={
              <Link to="/app/categories" className={buttonStyles()}>
                Browse pets
              </Link>
            }
          />
        )
      ) : (
        <ul className="grid items-start gap-4 lg:grid-cols-2">
          <AnimatePresence initial={false}>
            {list.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                role={role}
                onChangeStatus={changeStatus}
                onChat={(person) => openChat({ sellerId: person.id })}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </PageTransition>
  );
}
