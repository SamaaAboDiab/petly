import { animate, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/** Animates a number from 0 to `target` once the element scrolls into view. */
export function useCountUp(target, duration = 1.2) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, target, duration]);

  return [ref, value];
}
