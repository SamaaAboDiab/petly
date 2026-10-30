import { Heart, Home, LayoutGrid, MessageCircle, Package, ShieldCheck, ShoppingBag, User } from 'lucide-react';

/**
 * Single source of truth for app navigation — sidebar, bottom nav and command
 * palette read it. `badge` names a live counter the sidebar shows next to the item;
 * `mobile` puts it in the bottom bar (4 slots around the central "+" button).
 */
export const NAV_ITEMS = [
  { to: '/app', label: 'Home', icon: Home, end: true, mobile: true },
  { to: '/app/categories', label: 'Categories', icon: LayoutGrid, mobile: true },
  { to: '/app/favorites', label: 'Favorites', icon: Heart, fillWhenActive: true, mobile: true },
  { to: '/app/messages', label: 'Messages', icon: MessageCircle, badge: 'messages' },
  { to: '/app/cart', label: 'Cart', icon: ShoppingBag, badge: 'cart' },
  { to: '/app/orders', label: 'Orders', icon: Package },
  { to: '/app/profile', label: 'Profile', icon: User, mobile: true },
  { to: '/app/admin', label: 'Admin', icon: ShieldCheck, adminOnly: true },
];

/** Items the given user may see. */
export const navItemsFor = (user) => NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin');

/** On mobile, cart and messages live in the top bar; orders and admin in Profile. */
export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobile);
