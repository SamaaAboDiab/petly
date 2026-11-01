import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CATEGORIES } from '@/data/pets';
import { cn } from '@/lib/cn';
import CategoryIcon from './CategoryIcon';

export const PRICE_LIMITS = [
  { value: '', label: 'Any price' },
  { value: '2000', label: 'Under EGP 2,000' },
  { value: '5000', label: 'Under EGP 5,000' },
  { value: '10000', label: 'Under EGP 10,000' },
];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

const chip = (active) =>
  cn(
    'focus-ring flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
    active ? 'border-brand-400 bg-brand-400 text-on-brand' : 'border-line text-muted hover:border-brand-300 hover:text-ink',
  );

function Group({ label, children }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{label}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Filter panel (bottom sheet on phones). `onApply({ type, maxPrice, sort })`
 * receives only the chosen values; empty strings mean "no filter".
 */
export default function FilterSheet({ open, onClose, onApply, initial = {} }) {
  const [type, setType] = useState(initial.type ?? 'all');
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ?? '');
  const [sort, setSort] = useState(initial.sort ?? 'featured');

  const reset = () => {
    setType('all');
    setMaxPrice('');
    setSort('featured');
  };

  return (
    <Modal open={open} onClose={onClose} title="Filters" className="max-w-md">
      <div className="space-y-6 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <SlidersHorizontal className="size-5 text-brand-500" /> Filters
        </h2>

        <Group label="Pet type">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(({ id, label }) => (
              <button key={id} type="button" aria-pressed={type === id} onClick={() => setType(id)} className={chip(type === id)}>
                <CategoryIcon category={id} className="size-4" />
                <span className="sr-only sm:not-sr-only">{label}</span>
              </button>
            ))}
          </div>
        </Group>

        <Group label="Price">
          <div className="grid grid-cols-2 gap-2">
            {PRICE_LIMITS.map(({ value, label }) => (
              <button key={label} type="button" aria-pressed={maxPrice === value} onClick={() => setMaxPrice(value)} className={chip(maxPrice === value)}>
                {label}
              </button>
            ))}
          </div>
        </Group>

        <Group label="Sort by">
          <div className="grid grid-cols-2 gap-2">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button key={value} type="button" aria-pressed={sort === value} onClick={() => setSort(value)} className={chip(sort === value)}>
                {label}
              </button>
            ))}
          </div>
        </Group>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={reset}>
            Reset
          </Button>
          <Button block onClick={() => onApply({ type, maxPrice, sort })}>
            Show pets
          </Button>
        </div>
      </div>
    </Modal>
  );
}
