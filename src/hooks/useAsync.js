import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async function and tracks { data, loading, error }.
 * Ignores stale responses when deps change before the request resolves.
 */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    asyncFn()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, reload };
}
