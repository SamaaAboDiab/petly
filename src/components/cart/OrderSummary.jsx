import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Lock, Tag } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice, pluralize } from '@/lib/format';

function Row({ label, value, className = 'text-muted' }) {
  return (
    <div className={`flex items-center justify-between text-sm ${className}`}>
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

export default function OrderSummary({ onCheckout, processing }) {
  const { totals, promoCode, applyPromo } = useCart();
  const toast = useToast();
  const [promoOpen, setPromoOpen] = useState(false);
  const [code, setCode] = useState('');

  const handleApply = async (event) => {
    event.preventDefault();
    if (await applyPromo(code)) {
      toast({ title: 'Promo applied', description: `${code.toUpperCase()} is now active` });
      setPromoOpen(false);
      setCode('');
    } else {
      toast({ title: 'Invalid code', description: 'Try PETLY10 or HAPPYPET', variant: 'error' });
    }
  };

  return (
    <aside className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6 lg:sticky lg:top-28">
      <h2 className="text-lg font-bold text-ink">Order Summary</h2>

      <div className="mt-5 space-y-3.5">
        <Row label={`Subtotal (${pluralize(totals.count, 'item')})`} value={formatPrice(totals.subtotal)} />
        <Row
          label={totals.sellerCount > 1 ? `Delivery (${totals.sellerCount} sellers)` : 'Delivery Fee'}
          value={formatPrice(totals.delivery)}
        />
        <AnimatePresence>
          {totals.discount > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Row label={`Discount (${promoCode})`} value={`− ${formatPrice(totals.discount)}`} className="text-emerald-600" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="border-t border-dashed border-line pt-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink">Total</span>
            <motion.span
              key={totals.total}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className="text-xl font-extrabold text-ink"
            >
              {formatPrice(totals.total)}
            </motion.span>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-brand-50 dark:bg-brand-400/10">
        <button
          type="button"
          onClick={() => setPromoOpen((open) => !open)}
          aria-expanded={promoOpen}
          className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-sm text-ink"
        >
          <Tag className="size-5 text-brand-600 dark:text-brand-300" />
          <span className="flex-1 text-left">{promoCode ? `Code ${promoCode} applied` : 'Have a promo code?'}</span>
          <ChevronRight className={`size-4 transition-transform ${promoOpen ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {promoOpen && (
            <motion.form
              onSubmit={handleApply}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 px-4 pb-4"
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="PETLY10"
                aria-label="Promo code"
                className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm uppercase text-ink outline-none focus:border-brand-400"
              />
              <Button type="submit" size="sm" variant="dark" disabled={!code.trim()}>
                Apply
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <Button size="lg" block className="mt-5" onClick={onCheckout} loading={processing} disabled={totals.count === 0}>
        {processing ? 'Processing…' : 'Proceed to Checkout'}
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Lock className="size-3.5" /> Secure and encrypted payment
      </p>
    </aside>
  );
}
