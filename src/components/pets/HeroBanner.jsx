import { motion } from 'framer-motion';
import { Search, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import FilterSheet from './FilterSheet';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=900&q=80';

export default function HeroBanner() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  /** Opens the results page with the search text plus any chosen filters. */
  const goToResults = (filters = {}) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
    navigate(`/app/categories${params.size ? `?${params}` : ''}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToResults();
  };

  return (
    <section className="on-brand relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-200 via-brand-300 to-brand-400 p-5 sm:p-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 size-72 rounded-full bg-brand-500/30 blur-3xl" />

      {/* Mobile: the puppy fills the right side and fades into the card, like the design. */}
      <motion.img
        src={HERO_IMAGE}
        alt=""
        aria-hidden
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none absolute right-0 top-0 h-[calc(100%-5rem)] w-[58%] object-cover object-[60%_30%] [mask-image:linear-gradient(to_left,black_35%,transparent_95%),linear-gradient(to_top,transparent,black_35%)] [mask-composite:intersect] md:hidden"
      />

      <div className="relative grid items-center gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-brand-700 backdrop-blur md:inline-flex"
          >
            <Sparkles className="size-3.5" /> 2,000+ pets found a home this year
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-[60%] text-[2rem] font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl md:mt-4 md:max-w-none lg:text-6xl"
          >
            Find Your <br />
            Perfect Pet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-[55%] text-sm text-ink/75 sm:text-base md:max-w-sm"
          >
            Healthy pets, trusted sellers, all in one place.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex max-w-md items-center gap-2 rounded-2xl bg-white p-1.5 pl-4 shadow-lift transition focus-within:ring-4 focus-within:ring-white/60"
          >
            <Search className="size-5 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for dogs, cats, birds..."
              aria-label="Search pets"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted"
            />
            {/* Enter searches; this button opens the filter panel. */}
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Filters"
              className="focus-ring grid size-10 place-items-center rounded-xl bg-ink text-white transition hover:scale-105"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </motion.form>
          <FilterSheet
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            onApply={(filters) => {
              setFiltersOpen(false);
              goToResults(filters);
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
          className="relative mx-auto hidden w-full max-w-sm md:block"
        >
          <div className="absolute inset-6 rotate-6 rounded-[2.5rem] bg-white/40" />
          <SmartImage
            src={HERO_IMAGE}
            alt="Happy golden retriever puppy"
            className="relative aspect-square animate-float rounded-[2.5rem] border-4 border-white/70 shadow-lift"
          />
          <div className="absolute -left-8 bottom-10 flex animate-float-slow items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lift">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-bold text-ink">Health Checked</p>
              <p className="text-[11px] text-muted">by certified vets</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
