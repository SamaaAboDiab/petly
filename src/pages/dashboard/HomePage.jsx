import { Cat, ChevronDown, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import BreedCard, { BreedCardSkeleton } from '@/components/pets/BreedCard';
import CategoryFilter from '@/components/pets/CategoryFilter';
import HeroBanner from '@/components/pets/HeroBanner';
import PetGrid from '@/components/pets/PetGrid';
import PromoBanner from '@/components/pets/PromoBanner';
import TrustStrip from '@/components/pets/TrustStrip';
import SectionHeader from '@/components/ui/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/data/pets';
import { useAsync } from '@/hooks/useAsync';
import { petService } from '@/services/petService';

export default function HomePage() {
  const { user } = useAuth();
  const [category, setCategory] = useState('all');
  const featured = useAsync(() => petService.getFeatured(category), [category]);
  const breeds = useAsync(() => petService.getBreeds(), []);

  return (
    <PageTransition className="space-y-7 lg:space-y-14">
      {/* Mobile location row (on desktop it lives in the top bar). */}
      <Link
        to="/app/settings"
        className="focus-ring -mt-2 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-ink lg:hidden"
      >
        <MapPin className="size-4 text-ink/70" />
        {user?.location ?? 'Cairo, Egypt'}
        <ChevronDown className="size-4 text-muted" />
      </Link>

      <HeroBanner />
      {/* Extra on larger screens; the mobile design goes straight to categories. */}
      <div className="hidden sm:block">
        <TrustStrip />
      </div>

      <section>
        <CategoryFilter value={category} onChange={setCategory} className="mb-7 lg:mb-8" />
        <SectionHeader
          title="Featured Pets"
          subtitle={<span className="hidden sm:inline">Hand-picked friends looking for a home</span>}
          to={category === 'all' ? '/app/categories' : `/app/categories?type=${category}`}
          className="mb-4 sm:mb-5"
        />
        <PetGrid pets={featured.data} loading={featured.loading} mobileCarousel />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <PromoBanner
          title="Birds Collection"
          description="Colorful friends for your home"
          image={CATEGORIES.find((c) => c.id === 'birds').cover}
          to="/app/categories?type=birds"
        />
        <PromoBanner
          title="Cats Corner"
          description="Calm, cuddly and litter trained"
          icon={Cat}
          to="/app/categories?type=cats"
          className="hidden md:flex"
        />
      </section>

      <section>
        <SectionHeader title="Popular Breeds" to="/app/categories" />
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
          {breeds.loading
            ? Array.from({ length: 6 }, (_, i) => <BreedCardSkeleton key={i} />)
            : breeds.data?.map((breed) => <BreedCard key={breed.id} breed={breed} />)}
        </div>
      </section>
    </PageTransition>
  );
}
