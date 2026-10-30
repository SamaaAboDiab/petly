import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { DELIVERY_FEE } from '@/data/pets';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

const isSold = (pet) => pet.status === 'sold';

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id;

  // Cart lines live on the server; which lines are ticked for checkout is a
  // UI choice, so it stays local.
  const [lines, setLines] = useState([]);
  const [unselectedIds, setUnselectedIds] = useState(() => new Set());
  const [orders, setOrders] = useState([]);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    setLines([]);
    setOrders([]);
    setPromo(null);
    setUnselectedIds(new Set());
    if (!userId) return;

    let cancelled = false;
    Promise.all([cartService.get(), orderService.mine()])
      .then(([cartLines, myOrders]) => {
        if (cancelled) return;
        setLines(cartLines);
        setOrders(myOrders);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /** Runs a cart request and adopts the cart the server returns. */
  const sync = useCallback(
    async (requestPromise) => {
      try {
        setLines(await requestPromise);
        return true;
      } catch (error) {
        toast({ title: 'Cart update failed', description: error.message, variant: 'error' });
        return false;
      }
    },
    [toast],
  );

  const addItem = useCallback((pet) => sync(cartService.add(pet.id)), [sync]);
  const removeItem = useCallback((petId) => sync(cartService.remove(petId)), [sync]);
  const clear = useCallback(() => sync(cartService.clear()), [sync]);

  const toggleSelected = useCallback((petId) => {
    setUnselectedIds((current) => {
      const next = new Set(current);
      if (next.has(petId)) next.delete(petId);
      else next.add(petId);
      return next;
    });
  }, []);

  const setAllSelected = useCallback(
    (selected) => setUnselectedIds(selected ? new Set() : new Set(lines.map((line) => line.pet.id))),
    [lines],
  );

  /** Returns true when the server accepts the code. */
  const applyPromo = useCallback(async (code) => {
    try {
      setPromo(await orderService.validatePromo(code));
      return true;
    } catch {
      return false;
    }
  }, []);

  // A pet sold to someone else stays visible (so the user knows) but can't be selected.
  const items = useMemo(
    () => lines.map((line) => ({ ...line, sold: isSold(line.pet), selected: !isSold(line.pet) && !unselectedIds.has(line.pet.id) })),
    [lines, unselectedIds],
  );

  // Preview only — mirrors the server: one order (and one delivery fee) per
  // seller, discount rounded per order. The server recomputes on checkout.
  const totals = useMemo(() => {
    const selected = items.filter((item) => item.selected);
    const bySeller = new Map();
    selected.forEach(({ pet }) => bySeller.set(pet.sellerId, (bySeller.get(pet.sellerId) ?? 0) + pet.price));
    const sellerSubtotals = [...bySeller.values()];

    const subtotal = sellerSubtotals.reduce((sum, value) => sum + value, 0);
    const discount = promo ? sellerSubtotals.reduce((sum, value) => sum + Math.round(value * promo.rate), 0) : 0;
    const delivery = bySeller.size * DELIVERY_FEE;
    return {
      selected,
      count: selected.length,
      sellerCount: bySeller.size,
      subtotal,
      discount,
      delivery,
      total: subtotal - discount + delivery,
    };
  }, [items, promo]);

  /** Places the order(s) for the ticked pets. Throws ApiError on failure. */
  const checkout = useCallback(async () => {
    const petIds = totals.selected.map((item) => item.pet.id);
    try {
      const newOrders = await orderService.create({ petIds, promoCode: promo?.code ?? null });
      setLines((current) => current.filter((line) => !petIds.includes(line.pet.id)));
      setOrders((current) => [...newOrders, ...current]);
      setPromo(null);
      return newOrders;
    } catch (error) {
      // Someone may have bought a pet meanwhile — refresh so it shows as sold.
      cartService.get().then(setLines).catch(() => {});
      throw error;
    }
  }, [totals, promo]);

  /** Applies a status change returned by the server to my purchases list. */
  const replaceOrder = useCallback(
    (order) => setOrders((current) => current.map((o) => (o.id === order.id ? order : o))),
    [],
  );

  const value = useMemo(
    () => ({
      items,
      orders,
      promoCode: promo?.code ?? null,
      itemCount: items.filter((item) => !item.sold).length,
      totals,
      addItem,
      removeItem,
      toggleSelected,
      setAllSelected,
      clear,
      applyPromo,
      checkout,
      replaceOrder,
      isInCart: (petId) => lines.some((line) => line.pet.id === petId),
    }),
    [items, orders, promo, lines, totals, addItem, removeItem, toggleSelected, setAllSelected, clear, applyPromo, checkout, replaceOrder],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
