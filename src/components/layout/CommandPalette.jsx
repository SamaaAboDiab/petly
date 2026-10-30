import { CornerDownLeft, Search, SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import SmartImage from '@/components/ui/SmartImage';
import { navItemsFor } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import { petService } from '@/services/petService';

function buildResults(query, foundPets, user) {
  const q = query.trim().toLowerCase();
  const pets = foundPets.map((pet) => ({
    id: `pet-${pet.id}`,
    group: 'Pets',
    label: pet.name,
    sub: `${pet.age} • ${pet.location} • ${formatPrice(pet.price)}`,
    image: pet.images[0],
    to: `/app/pets/${pet.id}`,
  }));
  const pages = navItemsFor(user).filter((item) => item.label.toLowerCase().includes(q)).map((item) => ({
    id: `page-${item.to}`,
    group: 'Pages',
    label: item.label,
    sub: 'Go to page',
    icon: item.icon,
    to: item.to,
  }));
  return [...pets, ...pages];
}

/** ⌘K / Ctrl+K quick search across pets and pages, fully keyboard driven. */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 200);
  const search = useAsync(
    () => (open ? petService.search(debouncedQuery) : Promise.resolve([])),
    [open, debouncedQuery],
  );
  // Keep showing the previous pets while the next search is in flight.
  const results = useMemo(() => buildResults(query, search.data ?? [], user), [query, search.data, user]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const select = (result) => {
    if (!result) return;
    navigate(result.to);
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter') {
      select(results[activeIndex]);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Search" position="top" hideClose className="max-w-xl">
      <div className="flex items-center gap-3 border-b border-line px-5">
        <Search className="size-5 text-brand-500" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search pets, breeds, cities or pages…"
          aria-label="Search"
          className="h-16 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
        <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">ESC</kbd>
      </div>

      <ul className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
        {results.length === 0 && !search.loading && (
          <li className="flex flex-col items-center gap-3 px-4 py-10 text-center text-sm text-muted">
            <SearchX className="size-8 text-brand-500" />
            No results for “{query}”
          </li>
        )}
        {results.map((result, index) => {
          const showGroup = index === 0 || results[index - 1].group !== result.group;
          const Icon = result.icon;
          return (
            <li key={result.id} role="option" aria-selected={index === activeIndex}>
              {showGroup && (
                <p className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted">{result.group}</p>
              )}
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(result)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
                  index === activeIndex ? 'bg-brand-100 dark:bg-brand-400/15' : 'hover:bg-surface-2',
                )}
              >
                {result.image ? (
                  <SmartImage src={result.image} alt="" className="size-11 shrink-0 rounded-xl" />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink">
                    <Icon className="size-5" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">{result.label}</span>
                  <span className="block truncate text-xs text-muted">{result.sub}</span>
                </span>
                {index === activeIndex && <CornerDownLeft className="size-4 text-muted" />}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
