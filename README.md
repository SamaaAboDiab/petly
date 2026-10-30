# 🐾 Petly — Happy Pets, Happy Homes

A full-stack pet marketplace: **React 19 + Tailwind CSS v4 + Framer Motion** on the front,
**Express + MongoDB** in [`server/`](server/README.md).

```bash
# 1) API (first time: create server/.env with PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRE, CLIENT_URL)
cd server && npm install && npm run seed && npm run dev    # http://localhost:5000

# 2) Frontend (new terminal, project root)
npm install
npm run dev      # http://localhost:5173 — /api is proxied to :5000
```

**Demo account:** `demo@petly.com` / `petly123` (or click **Use demo account** on the login page).

## User flow

`/` Splash (animated loader) → `/login` · `/register` → `/app` Dashboard
(Home · Categories · Pet details · Cart · Favorites · Profile)

## Highlights

- Animated splash screen with progress, orbiting pets and a paw-print trail
- Split-screen auth with floating pet cards, validation, password strength meter
- Skeleton loaders for every async section + shimmering image placeholders
- 3D tilt + light-glare hover on pet cards, micro-interactions everywhere
- **⌘K / Ctrl+K command palette** — keyboard-driven search across pets & pages
- Dark mode (persisted), toasts, swipeable gallery + fullscreen lightbox
- Cart with select / quantity / promo codes (`PETLY10`, `HAPPYPET`) and a confetti checkout
- "List a pet" flow (+ button) that publishes new listings
- URL-driven filters (`?type=dogs&q=husky&sort=price-asc`) — shareable & refresh-safe
- Code-split routes, protected / guest route guards, reduced-motion support

## Project structure

```
src/
├── components/
│   ├── ui/          # Design-system primitives: Button, Input, Modal, Skeleton, SmartImage…
│   ├── layout/      # Sidebar, Topbar, MobileNav, CommandPalette, PageTransition
│   ├── pets/        # PetCard, PetGrid, PetGallery, CategoryFilter, HeroBanner…
│   ├── cart/        # CartItem, OrderSummary, QuantityStepper, CheckoutSuccess
│   ├── auth/        # Shared auth-form parts
│   ├── profile/     # StatCard, MenuItem
│   └── feedback/    # Toaster, PageLoader
├── config/          # navigation.js — single source for all menus
├── context/         # Auth, Theme, Toast, Cart, Favorites (+ AppProviders)
├── data/            # Static content (categories, breeds, showcase)
├── hooks/           # useAsync, useForm, useDebounce, useCountUp, useHotkey, usePetActions…
├── layouts/         # AuthLayout, DashboardLayout
├── lib/             # cn, format, storage, validators
├── pages/           # Route-level pages (lazy loaded)
├── routes/          # AppRouter + guards
└── services/        # api.js + auth / pet / cart / favorite / order services
```

### Extending it

- **API calls:** all go through `request()` in `services/api.js` (token, errors, base URL). Set `VITE_API_URL` in production.
- **New page:** create it in `pages/`, register it in `routes/AppRouter.jsx`, add a menu entry in `config/navigation.js`.
- **Design tokens:** colors, shadows and animations live in `src/index.css` (`@theme`). Use the `.on-brand` class / `text-on-brand` for content placed on yellow surfaces.
