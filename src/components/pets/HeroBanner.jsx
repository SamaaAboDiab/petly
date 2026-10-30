import { motion } from 'framer-motion';
import { Search, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=900&q=80';

export default function HeroBanner() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/app/categories?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="on-brand relative overflow-hidden rounded-[2rem] bg-linear-to-br from-brand-200 via-brand-300 to-brand-400 p-6 sm:p-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 size-72 rounded-full bg-brand-500/30 blur-3xl" />

      <div className="relative grid items-center gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-brand-700 backdrop-blur"
          >
            <Sparkles className="size-3.5" /> 2,000+ pets found a home this year
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Find Your <br />
            Perfect Pet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-sm text-sm text-ink/75 sm:text-base"
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
            <button
              type="submit"
              aria-label="Search"
              className="focus-ring grid size-10 place-items-center rounded-xl bg-ink text-white transition hover:scale-105"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </motion.form>
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
