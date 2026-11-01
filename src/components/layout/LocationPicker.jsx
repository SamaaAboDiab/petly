import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Loader2, MapPin, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CITIES, cityOf } from '@/data/locations';
import { cn } from '@/lib/cn';
import { accountService } from '@/services/accountService';

/**
 * "📍 Cairo, Egypt ⌄" — picks the user's city and saves it to their profile.
 * The city is the default location for new listings and powers "pets near you".
 */
export default function LocationPicker({ className, align = 'left' }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(null);
  const rootRef = useRef(null);
  const current = user?.location ?? 'Cairo, Egypt';

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const onPointerDown = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = async (label) => {
    if (label === current) return setOpen(false);
    setSaving(label);
    try {
      updateUser(await accountService.updateProfile({ name: user.name, location: label }));
      toast({ title: `Location set to ${cityOf(label)}`, description: 'Used as the default when you list a pet' });
      setOpen(false);
    } catch (error) {
      toast({ title: 'Couldn’t update location', description: error.message, variant: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const q = query.trim().toLowerCase();
  const cities = q ? CITIES.filter(({ city }) => city.toLowerCase().includes(q)) : CITIES;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="focus-ring flex items-center gap-1.5 rounded-xl px-1 py-1 text-sm font-medium text-ink transition hover:text-brand-600 dark:hover:text-brand-300"
      >
        <MapPin className="size-4 text-brand-500" />
        {current}
        <ChevronDown className={cn('size-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full z-40 mt-2 w-72 overflow-hidden rounded-3xl border border-line bg-surface shadow-lift',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <label className="m-3 flex h-10 items-center gap-2 rounded-xl bg-surface-2 px-3 text-sm">
              <Search className="size-4 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities"
                aria-label="Search cities"
                className="flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
              />
            </label>
            <ul role="listbox" aria-label="Cities" className="max-h-64 overflow-y-auto px-2 pb-2">
              {cities.map(({ city, label }) => {
                const selected = label === current;
                return (
                  <li key={label} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      onClick={() => choose(label)}
                      disabled={Boolean(saving)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        selected ? 'bg-brand-100 font-semibold text-ink dark:bg-brand-400/15' : 'text-ink hover:bg-surface-2',
                      )}
                    >
                      {city}
                      {saving === label ? (
                        <Loader2 className="size-4 animate-spin text-muted" />
                      ) : (
                        selected && <Check className="size-4 text-brand-600 dark:text-brand-300" />
                      )}
                    </button>
                  </li>
                );
              })}
              {cities.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No city matches “{query}”</li>}
            </ul>
            <Link
              to={`/app/categories?q=${encodeURIComponent(cityOf(current))}`}
              onClick={() => setOpen(false)}
              className="block border-t border-line px-4 py-3 text-sm font-semibold text-brand-600 hover:bg-surface-2 dark:text-brand-300"
            >
              See pets in {cityOf(current)} →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
