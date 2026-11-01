# Petly API

Express + MongoDB (Mongoose) + Socket.IO API for the Petly pet marketplace.
Started from an e-commerce training backend and adapted for pets: listings by any user, real-time chat,
notifications, favorites, orders, promo codes, account settings, support tickets and an admin dashboard.

## Setup

```bash
cd server
npm install
# create .env (see below)
npm run seed             # demo users + 13 pets (only touches the demo accounts)
npm run dev              # http://localhost:5000 (REST + Socket.IO on the same port)
```

### Environment variables

| Name | Required | Notes |
|---|---|---|
| `MONGO_URI` | yes | Atlas connection string, with a database name (`...mongodb.net/petly?...`) |
| `JWT_SECRET` | yes | long random string |
| `JWT_EXPIRE` | no | default `7d` |
| `PORT` | no | default `5000` |
| `CLIENT_URL` | no | comma-separated allowed frontends; first one is used in emailed links. Default `http://localhost:5173` |
| `RESEND_API_KEY` | no | enables real emails (password reset). Without it, emails are printed in the server terminal |
| `EMAIL_FROM` | no | e.g. `Petly <noreply@yourdomain.com>` (default: Resend's test sender) |
| `BLOB_READ_WRITE_TOKEN` | on Vercel | stores uploaded photos in Vercel Blob. Without it they're written to `uploads/` (local only) |

Seeded accounts:

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| user  | demo@petly.com     | petly123  |
| user  | mariam@petly.com   | petly123  |
| user  | omar@petly.com     | petly123  |
| admin | admin@petly.com    | Admin123  |

## Endpoints

All responses: `{ success: true, data }` or `{ success: false, message, errors: [{ field, message }] }`.
Private routes need `Authorization: Bearer <token>`.

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` · `/login` | public | rate-limited |
| POST | `/api/auth/forgot-password` | public | `{ email }` — same answer whether or not the account exists |
| POST | `/api/auth/reset-password` | public | `{ token, password }` — one-time, 30 min; signs in |
| GET | `/api/auth/me` | user | |
| PATCH | `/api/account/profile` | user | multipart: `name`, `location`, `avatar` file or `removeAvatar` |
| PATCH | `/api/account/password` | user | `{ currentPassword, newPassword }` |
| PATCH | `/api/account/preferences` | user | `{ notifications: { orders, activity, account } }` |
| GET | `/api/pets` | public | available pets only — `?category=dogs&search=husk&sort=price-asc&page=1&limit=24` |
| GET | `/api/pets/categories` | public | counts per category |
| GET | `/api/pets/mine` | user | my listings |
| GET | `/api/pets/:idOrSlug` | public | `{ pet, seller, related }` |
| POST | `/api/pets` | user | multipart: fields + up to 5 `images` (or `imageUrl`) |
| PUT · DELETE | `/api/pets/:id` | owner / admin | sold pets can't be edited; delete also cleans favorites |
| GET · POST · DELETE | `/api/cart/...` | user | `{ petId }` — each pet is one animal; own or sold pets are rejected |
| GET · POST · DELETE | `/api/favorites/...` | user | toggle `pets/:id` · `sellers/:id`, clear `:type` |
| POST | `/api/orders/promo` | user | `{ code }` → `{ code, rate }` |
| POST | `/api/orders` | user | `{ items: [{ petId }], promoCode? }` → one order per seller; pets are reserved atomically and marked sold |
| GET | `/api/orders/mine` · `/api/orders/sales` | user | my purchases (with seller) · my sales (with buyer) |
| PATCH | `/api/orders/:id/status` | buyer / seller | seller: pending→confirmed→delivered, or cancel; buyer: cancel while pending. Cancel relists the pets |
| GET | `/api/sellers/:id` | public | seller profile, pets for sale, sold count |
| GET · POST | `/api/conversations` | user | list / start `{ sellerId, petId? }` |
| GET | `/api/conversations/unread-count` | user | |
| GET · POST | `/api/conversations/:id/messages` | participants | `?before=<date>` pages of 30 · `{ text }` |
| POST | `/api/conversations/:id/read` | participants | |
| GET | `/api/notifications` | user | `?before=<date>`, includes `unread` |
| POST | `/api/notifications/:id/read` · `/read-all` | user | |
| POST · GET | `/api/support` · `/api/support/mine` | user | `{ category, subject, message }` |
| GET | `/api/admin/stats` | admin | totals, 14-day orders, pets by category, recent orders |
| GET | `/api/admin/pets` · `/orders` · `/tickets` | admin | search + pagination |
| PATCH | `/api/admin/tickets/:id` | admin | `{ reply, status }` — notifies the user |
| GET · PATCH · DELETE | `/api/users/...` | admin | search, `/:id/role`, `/:id/verify`, delete (cleans up listings, carts, favorites) |

### Socket.IO events

Connect with `io(API_ORIGIN, { auth: { token } })`. Each user only receives their own events.

| Event | Direction | Payload |
|---|---|---|
| `message:new` | server → client | `{ message, conversation }` |
| `conversation:read` | server → client | `{ conversationId }` |
| `notification:new` | server → client | notification |
| `typing` | both | `{ conversationId }` (relayed only to the other participant) |

## Security notes

- Passwords hashed with bcrypt and never returned; login errors don't reveal which field was wrong.
- Reset tokens are random, stored only as SHA-256 hashes, expire in 30 minutes and work once.
- NoSQL injection: `simple` query parser + `$`/`.` key stripping on JSON bodies; search terms are regex-escaped.
- Uploads: images only, 5MB, extension derived from MIME type (never the client file name); rejected requests delete their files.
- Sockets authenticate with the same JWT; chat membership is checked on every request and event.
- `helmet`, CORS whitelist (`CLIENT_URL`), rate limits (stricter on auth and password changes).
- Notifications respect each user's preferences at send time and are de-duplicated.

## Structure

```
src/
  config/       db.js, cors.js, constants.js (categories, promo codes, notification types…)
  models/       User, Pet, Cart, Order, Conversation, Message, Notification, SupportTicket
  controllers/  auth, account, pet, cart, favorite, order, conversation, notification, support, admin, user
  services/     orderService (checkout, reservations, status rules), notificationService, emailService
  socket/       Socket.IO setup + emitToUser
  routes/       one file per resource, mounted in routes/index.js
  middleware/   auth, validate, upload, sanitize, rateLimit, errorHandler, notFound
  validators/   express-validator chains per resource
  utils/        AppError, asyncHandler, generateToken, serializers, query
  seed/         data.js + seed.js
```
