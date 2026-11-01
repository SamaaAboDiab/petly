import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '@/components/cart/CartItem';
import CheckoutSuccess from '@/components/cart/CheckoutSuccess';
import OrderSummary from '@/components/cart/OrderSummary';
import PageTransition from '@/components/layout/PageTransition';
import { buttonStyles } from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import EmptyState from '@/components/ui/EmptyState';
import IconButton from '@/components/ui/IconButton';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { pluralize } from '@/lib/format';

export default function CartPage() {
  const { items, clear, checkout, setAllSelected } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [placedOrders, setPlacedOrders] = useState(null);

  const selectable = items.filter((item) => !item.sold);
  const allSelected = selectable.length > 0 && selectable.every((item) => item.selected);

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      setPlacedOrders(await checkout());
    } catch (error) {
      toast({ title: 'Checkout failed', description: error.message, variant: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    clear();
    toast({ title: 'Cart cleared', variant: 'info' });
  };

  return (
    <PageTransition>
      {/* Mobile header from the design: back · title · clear. */}
      <div className="mb-4 grid h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center lg:hidden">
        <IconButton icon={ArrowLeft} label="Back" variant="ghost" onClick={() => navigate(-1)} />
        <h1 className="text-center text-xl font-bold text-ink">My Cart</h1>
        {items.length > 0 && <IconButton icon={Trash2} label="Clear cart" variant="ghost" onClick={handleClear} />}
      </div>

      <div className="mb-8 hidden items-center justify-between lg:flex">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">My Cart</h1>
          <p className="mt-1 text-muted">{pluralize(items.length, 'pet')} in your cart</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="focus-ring flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <Trash2 className="size-4" /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven’t picked a new friend yet. Let’s fix that!"
          action={
            <Link to="/app/categories" className={buttonStyles()}>
              Browse pets
            </Link>
          }
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
          <div>
            <Checkbox
              round
              checked={allSelected}
              onChange={setAllSelected}
              label="Select all"
              className="mb-4 font-semibold"
            />
            <ul className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartItem key={item.pet.id} item={item} />
                ))}
              </AnimatePresence>
            </ul>
          </div>
          <OrderSummary onCheckout={handleCheckout} processing={processing} />
        </div>
      )}

      <CheckoutSuccess orders={placedOrders} onClose={() => setPlacedOrders(null)} />
    </PageTransition>
  );
}
