import { animate, AnimatePresence, motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import { useAuth } from '@/context/AuthContext';
import { SHOWCASE_PETS } from '@/data/pets';

const LOAD_SECONDS = 2.8;
const BRAND = 'Petly'.split('');
const ORBIT = [
  { pet: SHOWCASE_PETS[0], className: '-left-24 top-10 sm:-left-36', delay: 0.5 },
  { pet: SHOWCASE_PETS[1], className: '-right-24 top-10 sm:-right-36', delay: 0.7 },
  { pet: SHOWCASE_PETS[2], className: '-top-24 left-1/2 -translate-x-1/2 sm:-top-28', delay: 0.9 },
];
// Paw prints "walk" diagonally across the bottom of the screen.
const TRAIL = Array.from({ length: 8 }, (_, i) => ({
  left: `${8 + i * 11}%`,
  bottom: `${10 + (i % 2) * 5}%`,
  rotate: 70 + (i % 2) * 20,
  delay: 0.3 + i * 0.28,
}));

export default function SplashPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const controls = animate(0, 100, {
      duration: LOAD_SECONDS,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (value) => setProgress(Math.round(value)),
      onComplete: () => setLeaving(true),
    });
    return () => controls.stop();
  }, []);

  const finish = () => navigate(isAuthenticated ? '/app' : '/login', { replace: true });

  return (
    <AnimatePresence onExitComplete={finish}>
      {!leaving && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
          transition={{ duration: 0.5 }}
          className="relative grid min-h-dvh place-items-center overflow-hidden bg-canvas"
        >
          {/* Ambient blobs */}
          <motion.div
            className="absolute -left-40 -top-40 size-[32rem] rounded-full bg-brand-300/40 blur-3xl"
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-48 -right-40 size-[36rem] rounded-full bg-brand-400/30 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], y: [0, -30, 0] }}
            transition={{ duration: 7, repeat: Infinity }}
          />

          {/* Paw trail */}
          {TRAIL.map((paw, i) => (
            <motion.span
              key={i}
              className="absolute text-brand-400/50"
              style={{ left: paw.left, bottom: paw.bottom, rotate: paw.rotate }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0.5], scale: 1 }}
              transition={{ delay: paw.delay, duration: 0.6 }}
            >
              <PawPrint className="size-7" />
            </motion.span>
          ))}

          <div className="relative flex flex-col items-center px-6">
            <div className="relative">
              {/* Pulsing rings */}
              {[0, 1].map((ring) => (
                <motion.span
                  key={ring}
                  className="absolute inset-0 rounded-[2rem] border-2 border-brand-400"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.9, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 12 }}
                className="relative grid size-28 place-items-center rounded-[2rem] bg-brand-400 shadow-glow"
              >
                <motion.span
                  animate={{ rotate: [0, -12, 12, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }}
                >
                  <PawPrint className="size-14 text-on-brand" strokeWidth={2.2} />
                </motion.span>
              </motion.div>

              {/* Orbiting pets */}
              {ORBIT.map(({ pet, className, delay }) => (
                <motion.div
                  key={pet.id}
                  className={`absolute ${className}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay }}
                >
                  <SmartImage
                    src={pet.image}
                    alt=""
                    className="size-16 animate-float rounded-full border-4 border-surface shadow-lift sm:size-20"
                  />
                </motion.div>
              ))}
            </div>

            <h1 className="mt-16 flex text-5xl font-extrabold tracking-tight text-ink sm:text-6xl" aria-label="Petly">
              {BRAND.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 260, damping: 16 }}
                >
                  {letter}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-2 text-sm font-medium text-muted sm:text-base"
            >
              Happy Pets, Happy Homes
            </motion.p>

            <div className="mt-10 w-64 sm:w-72">
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-300 to-brand-500 transition-[width] duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs font-semibold text-muted">
                <span>{progress < 100 ? 'Fetching happy pets…' : 'Ready!'}</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
