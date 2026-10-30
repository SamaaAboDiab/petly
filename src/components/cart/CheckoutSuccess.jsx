import { motion } from 'framer-motion';
import { Check, PawPrint } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatPrice } from '@/lib/format';

/** Celebration modal with a paw-print confetti burst. `orders`: one per seller. */
export default function CheckoutSuccess({ orders, onClose }) {
  const firstId = orders?.[0]?.id;
  const paws = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 420,
        y: -Math.random() * 260 - 60,
        rotate: Math.random() * 360,
        delay: Math.random() * 0.2,
      })),
    // regenerate per checkout
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstId],
  );

  const count = orders?.length ?? 0;
  const total = orders?.reduce((sum, order) => sum + order.total, 0) ?? 0;

  return (
    <Modal open={count > 0} onClose={onClose} title="Order placed" className="max-w-md overflow-visible">
      <div className="relative flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <div className="pointer-events-none absolute left-1/2 top-24">
          {paws.map((paw) => (
            <motion.span
              key={paw.id}
              className="absolute text-brand-400"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
              animate={{ x: paw.x, y: paw.y, opacity: 0, scale: 1, rotate: paw.rotate }}
              transition={{ duration: 1.4, delay: paw.delay, ease: 'easeOut' }}
            >
              <PawPrint className="size-5" />
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
          className="on-brand grid size-24 place-items-center rounded-full bg-brand-400 shadow-glow"
        >
          <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.25 }}>
            <Check className="size-12 text-ink" strokeWidth={3} />
          </motion.span>
        </motion.div>
        <h2 className="mt-6 text-2xl font-extrabold text-ink">Order placed!</h2>
        <p className="mt-2 text-sm text-muted">
          {count === 1 ? (
            <>
              Order <span className="font-bold text-ink">#{orders[0].orderNumber}</span>
            </>
          ) : (
            <>
              <span className="font-bold text-ink">{count} orders</span> — one per seller
            </>
          )}{' '}
          • {formatPrice(total)}
        </p>
        <p className="mt-1 text-sm text-muted">The seller will confirm and contact you about delivery.</p>
        <div className="mt-7 flex w-full gap-3">
          <Link to="/app" onClick={onClose} className={buttonStyles({ variant: 'secondary', block: true })}>
            Keep browsing
          </Link>
          <Link to="/app/orders" onClick={onClose} className={buttonStyles({ block: true })}>
            Track order
          </Link>
        </div>
      </div>
    </Modal>
  );
}
