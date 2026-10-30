import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import SmartImage from '@/components/ui/SmartImage';
import { cn } from '@/lib/cn';

const VISIBLE_THUMBS = 4;

function ArrowButton({ direction, onClick, className }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous photo' : 'Next photo'}
      className={cn(
        'focus-ring grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition hover:scale-110 hover:bg-white',
        className,
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

export default function PetGallery({ images, name, children }) {
  const [[index, direction], setSlide] = useState([0, 0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const total = images.length;

  const paginate = useCallback(
    (step) => setSlide(([current]) => [(current + step + total) % total, step]),
    [total],
  );
  const goTo = (target) => setSlide(([current]) => [target, target > current ? 1 : -1]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') paginate(1);
      if (event.key === 'ArrowLeft') paginate(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen, paginate]);

  const slide = (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <motion.div
        key={index}
        custom={direction}
        initial={{ x: direction >= 0 ? '100%' : '-100%', opacity: 0.4 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: direction >= 0 ? '-100%' : '100%', opacity: 0.4 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        drag={total > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) paginate(1);
          else if (info.offset.x > 60) paginate(-1);
        }}
        className="absolute inset-0"
      >
        <SmartImage src={images[index]} alt={`${name} photo ${index + 1}`} className="size-full" draggable={false} />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div>
      <div className="group relative aspect-[4/3.2] overflow-hidden rounded-[2rem] bg-surface-2 shadow-soft">
        {slide}
        {children}
        {total > 1 && (
          <>
            <ArrowButton direction="prev" onClick={() => paginate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2" />
            <ArrowButton direction="next" onClick={() => paginate(1)} className="absolute right-4 top-1/2 -translate-y-1/2" />
          </>
        )}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="View full screen"
          className="focus-ring absolute bottom-4 left-4 grid size-10 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Expand className="size-4" />
        </button>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {index + 1}/{total}
        </span>
      </div>

      {total > 1 && (
        <div className="mt-4">
          <p className="mb-3 text-sm font-bold text-ink">More Photos</p>
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, VISIBLE_THUMBS).map((src, i) => {
              const isLastWithMore = i === VISIBLE_THUMBS - 1 && total > VISIBLE_THUMBS;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => (isLastWithMore ? setLightboxOpen(true) : goTo(i))}
                  aria-label={isLastWithMore ? `View all ${total} photos` : `Show photo ${i + 1}`}
                  className={cn(
                    'focus-ring relative overflow-hidden rounded-2xl ring-offset-2 ring-offset-canvas transition-all hover:-translate-y-1',
                    i === index && !isLastWithMore ? 'ring-3 ring-brand-400' : 'opacity-80 hover:opacity-100',
                  )}
                >
                  <SmartImage src={src} alt="" className="aspect-[4/3]" />
                  {isLastWithMore && (
                    <span className="absolute inset-0 grid place-items-center bg-black/55 text-lg font-bold text-white">
                      +{total - VISIBLE_THUMBS + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={`${name} photos`}
        className="max-w-5xl overflow-hidden bg-black p-0"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-video">
          {slide}
          {total > 1 && (
            <>
              <ArrowButton direction="prev" onClick={() => paginate(-1)} className="absolute left-4 top-1/2 -translate-y-1/2" />
              <ArrowButton direction="next" onClick={() => paginate(1)} className="absolute right-4 top-1/2 -translate-y-1/2" />
            </>
          )}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={cn('h-2 rounded-full transition-all', i === index ? 'w-6 bg-brand-400' : 'w-2 bg-white/60')}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
