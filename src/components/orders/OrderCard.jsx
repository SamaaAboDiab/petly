import { motion } from 'framer-motion';
import { Check, CheckCircle2, MessageCircle, PackageCheck, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/layout/UserAvatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/ui/SmartImage';
import { cn } from '@/lib/cn';
import { formatPrice, formatShortDate } from '@/lib/format';

const STEPS = ['pending', 'confirmed', 'delivered'];
const STEP_LABELS = { pending: 'Placed', confirmed: 'Confirmed', delivered: 'Delivered' };

export const STATUS_BADGE = {
  pending: { label: 'Waiting for seller', variant: 'brand' },
  confirmed: { label: 'Confirmed', variant: 'brand' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

/** Mirrors the server's ORDER_TRANSITIONS for the current viewer. */
const actionsFor = (role, status) => {
  if (role === 'seller') {
    if (status === 'pending') return ['confirmed', 'cancelled'];
    if (status === 'confirmed') return ['delivered', 'cancelled'];
  }
  if (role === 'buyer' && status === 'pending') return ['cancelled'];
  return [];
};

const ACTION_UI = {
  confirmed: { label: 'Confirm order', icon: CheckCircle2, variant: 'primary' },
  delivered: { label: 'Mark delivered', icon: PackageCheck, variant: 'primary' },
  cancelled: { label: 'Cancel', icon: XCircle, variant: 'ghost' },
};

function Timeline({ order }) {
  if (order.status === 'cancelled') {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">
        <X className="size-4" /> Cancelled {formatShortDate(order.statusHistory?.at(-1)?.at ?? order.updatedAt)}
      </p>
    );
  }
  const reached = STEPS.indexOf(order.status);
  return (
    <ol className="flex items-center">
      {STEPS.map((step, index) => {
        const done = index <= reached;
        return (
          <li key={step} className={cn('flex items-center', index < STEPS.length - 1 && 'flex-1')}>
            <span className="flex flex-col items-center gap-1">
              <motion.span
                initial={false}
                animate={{ scale: done ? 1 : 0.85 }}
                className={cn(
                  'grid size-7 place-items-center rounded-full border-2 transition-colors',
                  done ? 'on-brand border-brand-400 bg-brand-400 text-ink' : 'border-line bg-surface text-muted',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
              </motion.span>
              <span className={cn('text-[11px] font-semibold', done ? 'text-ink' : 'text-muted')}>{STEP_LABELS[step]}</span>
            </span>
            {index < STEPS.length - 1 && (
              <span className="mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                <motion.span
                  initial={false}
                  animate={{ width: index < reached ? '100%' : '0%' }}
                  className="block h-full bg-brand-400"
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** `role`: 'buyer' (my purchase) or 'seller' (my sale). */
export default function OrderCard({ order, role, onChangeStatus, onChat }) {
  const [busy, setBusy] = useState(null);
  const counterpart = role === 'buyer' ? order.seller : order.user;
  const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
  const actions = actionsFor(role, order.status);

  const run = async (status) => {
    setBusy(status);
    try {
      await onChangeStatus(order, status);
    } finally {
      setBusy(null);
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-line bg-surface p-5 shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-ink">#{order.orderNumber}</p>
          <p className="text-xs text-muted">{formatShortDate(order.createdAt)}</p>
        </div>
        <Badge variant={badge.variant}>{order.status === 'pending' && role === 'seller' ? 'Needs your confirmation' : badge.label}</Badge>
      </div>

      <div className="mt-4">
        <Timeline order={order} />
      </div>

      <ul className="mt-4 divide-y divide-line">
        {order.items.map((item, index) => (
          <li key={index} className="flex items-center gap-3 py-2.5">
            <SmartImage src={item.image} alt="" className="size-12 shrink-0 rounded-xl" />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{item.name}</p>
            <p className="text-sm font-bold tabular-nums text-ink">{formatPrice(item.price)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-2 space-y-1 border-t border-dashed border-line pt-3 text-sm">
        {order.discount > 0 && (
          <p className="flex justify-between text-emerald-600">
            <span>Discount ({order.promoCode})</span> <span>− {formatPrice(order.discount)}</span>
          </p>
        )}
        <p className="flex justify-between text-muted">
          <span>Delivery</span> <span>{formatPrice(order.deliveryFee)}</span>
        </p>
        <p className="flex justify-between font-bold text-ink">
          <span>Total</span> <span className="tabular-nums">{formatPrice(order.total)}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {counterpart ? (
          <Link
            to={`/app/sellers/${counterpart.id}`}
            className="focus-ring flex min-w-40 flex-1 items-center gap-2 rounded-xl text-sm hover:text-brand-600"
          >
            <UserAvatar user={counterpart} className="size-8 ring-0" />
            <span className="min-w-0">
              <span className="block text-[11px] text-muted">{role === 'buyer' ? 'Seller' : 'Buyer'}</span>
              <span className="block truncate font-semibold text-ink">{counterpart.name}</span>
            </span>
          </Link>
        ) : (
          <span className="flex-1 text-sm text-muted">Account deleted</span>
        )}
        {counterpart && (
          <Button size="sm" variant="secondary" leftIcon={MessageCircle} onClick={() => onChat(counterpart)}>
            Chat
          </Button>
        )}
        {actions.map((status) => {
          const ui = ACTION_UI[status];
          return (
            <Button
              key={status}
              size="sm"
              variant={ui.variant}
              leftIcon={ui.icon}
              loading={busy === status}
              disabled={Boolean(busy)}
              onClick={() => run(status)}
              className={status === 'cancelled' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' : undefined}
            >
              {ui.label}
            </Button>
          );
        })}
      </div>
    </motion.li>
  );
}
