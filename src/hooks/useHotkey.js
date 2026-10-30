import { useEffect, useRef } from 'react';

/** Calls `handler` on Ctrl/⌘ + key. */
export function useHotkey(key, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        handlerRef.current(event);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key]);
}
