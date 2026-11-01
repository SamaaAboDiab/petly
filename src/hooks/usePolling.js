import { useEffect, useRef } from 'react';

/**
 * Calls `callback` every `intervalMs` while `enabled` and the tab is visible
 * (and once right away when the tab becomes visible again). Used as the
 * fallback when there's no live socket — e.g. on serverless hosting.
 */
export function usePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;
    const tick = () => document.visibilityState === 'visible' && callbackRef.current();
    const timer = setInterval(tick, intervalMs);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [intervalMs, enabled]);
}
