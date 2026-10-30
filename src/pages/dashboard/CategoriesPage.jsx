import { ArrowDownUp, Search, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import CategoryCard, { CategoryCardSkeleton } from '@/components/pets/CategoryCard';
import CategoryFilter from '@/components/pets/CategoryFilter';
import PetGrid from '@/components/pets/PetGrid';
import Button from '@/components/ui/Button';
import SectionHeader from '@/components/ui/SectionHeader';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { pluralize } from '@/lib/format';
import { petService } from '@/services/petService';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function CategoriesPage() {
  // Filters live in the URL, so results are shareable and survive refresh.
  const [params, setParams] = useSearchParams();
  const category = params.get('type') ?? 'all';
  const query = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'featured';
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
  const pets = useAsync(
    () => petService.getPets({ category, query: debouncedQuery, sort }),
    [category, debouncedQuery, sort],
  );

  const resetFilters = () => setParams({}, { replace: true });

  return (
    <PageTransition className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Explore pets</h1>
        <p className="mt-1 text-muted">Browse by category, breed or city.</p>
      </div>

      <label className="group flex h-14 items-center gap-3 rounded-2xl border border-line bg-surface px-5 shadow-soft transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-300/30">
        <Search className="size-5 text-muted group-focus-within:text-brand-500" />
        <input
          value={query}
          onChange={(e) => updateParam('q', e.target.value)}
          placeholder="Search for pets, breeds, or cities..."
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
        <SectionHeader title="Categories" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-3 sm:gap-5">
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
        <SectionHeader
          title={category === 'all' ? 'All pets' : `${category[0].toUpperCase()}${category.slice(1)}`}
          subtitle={pets.loading ? 'Searching…' : pluralize(pets.data?.length ?? 0, 'pet') + ' available'}
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
