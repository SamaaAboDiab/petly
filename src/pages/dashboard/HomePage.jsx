import { Cat } from 'lucide-react';
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import BreedCard, { BreedCardSkeleton } from '@/components/pets/BreedCard';
import CategoryFilter from '@/components/pets/CategoryFilter';
import HeroBanner from '@/components/pets/HeroBanner';
import PetGrid from '@/components/pets/PetGrid';
import PromoBanner from '@/components/pets/PromoBanner';
import TrustStrip from '@/components/pets/TrustStrip';
import SectionHeader from '@/components/ui/SectionHeader';
import { CATEGORIES } from '@/data/pets';
import { useAsync } from '@/hooks/useAsync';
import { petService } from '@/services/petService';

export default function HomePage() {
  const [category, setCategory] = useState('all');
  const featured = useAsync(() => petService.getFeatured(category), [category]);
  const breeds = useAsync(() => petService.getBreeds(), []);

  return (
    <PageTransition className="space-y-10 lg:space-y-14">
      <HeroBanner />
      <TrustStrip />

      <section>
        <CategoryFilter value={category} onChange={setCategory} className="mb-8" />
        <SectionHeader
          title="Featured Pets"
          subtitle="Hand-picked friends looking for a home"
          to={category === 'all' ? '/app/categories' : `/app/categories?type=${category}`}
        />
        <PetGrid pets={featured.data} loading={featured.loading} />
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
