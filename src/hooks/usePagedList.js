import { useState } from 'react';
import { useAsync } from './useAsync';
import { useDebounce } from './useDebounce';

/**
 * Search + pagination state for admin lists.
 * `fetcher({ search, page, ...filters })` must resolve to `{ ..., page, totalPages }`.
 */
export function usePagedList(fetcher, filters = {}) {
  const [search, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const filterKey = JSON.stringify(filters);

  const result = useAsync(
    () => fetcher({ search: debouncedSearch, page, ...filters }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, page, filterKey],
  );

  // A new search always starts from the first page.
  const setSearch = (value) => {
    setSearchValue(value);
    setPage(1);
  };

  return { ...result, search, setSearch, page, setPage };
}
