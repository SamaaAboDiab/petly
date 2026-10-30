import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

/** useState that is mirrored to localStorage under `petly:<key>`. */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => storage.get(key, initialValue));

  useEffect(() => {
    storage.set(key, value);
  }, [key, value]);

  return [value, setValue];
}
