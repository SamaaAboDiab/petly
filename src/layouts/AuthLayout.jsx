import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import SmartImage from '@/components/ui/SmartImage';
import { SHOWCASE_PETS } from '@/data/pets';
import { formatPrice } from '@/lib/format';

const SHOWCASE = [
  { pet: SHOWCASE_PETS[0], className: 'left-[2%] top-[4%] -rotate-6', delay: 0.2 },
  { pet: SHOWCASE_PETS[1], className: 'right-[4%] top-[18%] rotate-6', delay: 0.4 },
  { pet: SHOWCASE_PETS[2], className: 'bottom-[2%] left-[30%] -rotate-3', delay: 0.6 },
];

function FloatingPetCard({ pet, className, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay }}
      className={`absolute w-40 xl:w-48 ${className}`}
    >
      <div className="animate-float rounded-3xl bg-white p-2 shadow-lift transition-transform duration-300 hover:scale-105" style={{ animationDelay: `${delay * 3}s` }}>
        <SmartImage src={pet.image} alt={pet.name} className="aspect-square rounded-2xl" />
        <div className="px-1.5 pb-1 pt-2.5">
          <p className="truncate text-sm font-bold text-[#1e1b16]">{pet.name}</p>
          <p className="text-sm font-extrabold text-brand-600">{formatPrice(pet.price)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Showcase panel (desktop) */}
      <aside className="on-brand relative hidden overflow-hidden bg-linear-to-br from-brand-200 via-brand-300 to-brand-500 lg:block">
        <div className="absolute -left-20 -top-20 size-96 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 size-[28rem] rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative flex h-full flex-col p-12">
          <Logo className="[&_p]:text-[#1e1b16]" />
          <div className="relative flex-1">
            {SHOWCASE.map((item) => (
              <FloatingPetCard key={item.pet.id} {...item} />
            ))}
          </div>
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-md rounded-3xl bg-white/45 p-6 backdrop-blur-md"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="size-4 fill-[#1e1b16] text-[#1e1b16]" />
              ))}
            </div>
            <p className="mt-3 font-semibold text-[#1e1b16]">
              “We found our Goldie in two days. Verified sellers and health records made it stress-free.”
            </p>
            <footer className="mt-3 text-sm text-[#1e1b16]/70">— Salma, adopted a Golden Retriever</footer>
          </motion.blockquote>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Logo className="mb-10 lg:hidden" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
