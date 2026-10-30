import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';

/** Suspense fallback while a lazy page chunk downloads. */
export default function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          >
            <PawPrint className="size-6 text-brand-400" />
          </motion.span>
        ))}
      </div>
    </div>
  );
}
