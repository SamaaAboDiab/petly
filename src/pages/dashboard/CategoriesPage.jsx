import { ArrowDownUp, ArrowRight, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import BreedCard, { BreedCardSkeleton } from '@/components/pets/BreedCard';
import CategoryCard, { CategoryCardSkeleton } from '@/components/pets/CategoryCard';
import CategoryFilter from '@/components/pets/CategoryFilter';
import { PRICE_LIMITS, SORT_OPTIONS } from '@/components/pets/FilterSheet';
import PetGrid from '@/components/pets/PetGrid';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { pluralize } from '@/lib/format';
import { petService } from '@/services/petService';

export default function CategoriesPage() {
  // Filters live in the URL, so results are shareable and survive refresh.
  const [params, setParams] = useSearchParams();
  const category = params.get('type') ?? 'all';
  const query = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'featured';
  const maxPrice = params.get('maxPrice') ?? '';
  const priceLabel = PRICE_LIMITS.find((p) => p.value === maxPrice && p.value)?.label;
  const debouncedQuery = useDebounce(query);

  const updateParam = (key, value, fallback) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (!value || value === fallback) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  const categories = useAsync(() => petService.getCategories(), []);
  const breeds = useAsync(() => petService.getBreeds(), []);
  const pets = useAsync(
    () => petService.getPets({ category, query: debouncedQuery, sort, maxPrice }),
    [category, debouncedQuery, sort, maxPrice],
  );

  const resetFilters = () => setParams({}, { replace: true });

  // "See All" shows every pet: clear the filters and jump to the results.
  const seeAll = (
    <button
      type="button"
      onClick={() => {
        resetFilters();
        document.getElementById('all-pets')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      className="focus-ring group inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-brand-600 dark:text-brand-300"
    >
      See All
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </button>
  );

  return (
    <PageTransition className="space-y-7 sm:space-y-10">
      {/* The mobile design goes straight to search, like the home screen. */}
      <div className="hidden sm:block">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Explore pets</h1>
        <p className="mt-1 text-muted">Browse by category, breed or city.</p>
      </div>

      <label className="group flex h-14 items-center gap-3 rounded-2xl border border-line bg-surface px-5 shadow-soft transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-300/30">
        <Search className="size-5 text-muted group-focus-within:text-brand-500" />
        <input
          value={query}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder="Search for pets, breeds, or sellers..."
          aria-label="Search pets"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        {query && (
          <button type="button" onClick={() => updateParam('q', '')} aria-label="Clear search" className="text-muted hover:text-ink">
            <X className="size-4" />
          </button>
        )}
      </label>

      <CategoryFilter value={category} onChange={(id) => updateParam('type', id, 'all')} />

      <section>
        <SectionHeader title="Categories" action={seeAll} />
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {categories.loading
            ? Array.from({ length: 3 }, (_, i) => <CategoryCardSkeleton key={i} />)
            : categories.data?.map((item) => (
                <CategoryCard
                  key={item.id}
                  category={item}
                  active={item.id === category}
                  onSelect={(id) => updateParam('type', id === category ? 'all' : id, 'all')}
                />
              ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Popular Breeds" action={seeAll} />
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
          {breeds.loading
            ? Array.from({ length: 6 }, (_, i) => <BreedCardSkeleton key={i} />)
            : breeds.data?.map((breed) => <BreedCard key={breed.id} breed={breed} />)}
        </div>
      </section>

      <section id="all-pets" className="scroll-mt-24">
        <SectionHeader
          title={category === 'all' ? 'All pets' : `${category[0].toUpperCase()}${category.slice(1)}`}
          subtitle={
            <span className="flex flex-wrap items-center gap-2">
              {pets.loading ? 'Searching…' : `${pluralize(pets.data?.length ?? 0, 'pet')} available`}
              {priceLabel && (
                <button
                  type="button"
                  onClick={() => updateParam('maxPrice', '')}
                  aria-label={`Remove filter: ${priceLabel}`}
                  className="focus-ring inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700 hover:bg-brand-200 dark:bg-brand-400/15 dark:text-brand-300"
                >
                  {priceLabel} <X className="size-3" />
                </button>
              )}
            </span>
          }
          action={
            <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink transition hover:border-brand-300">
              <ArrowDownUp className="size-4 text-muted" />
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value, 'featured')}
                className="cursor-pointer bg-transparent font-semibold outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-surface">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          }
        />
        <PetGrid
          pets={pets.data}
          loading={pets.loading}
          emptyAction={
            <Button variant="secondary" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      </section>
    </PageTransition>
  );
}
