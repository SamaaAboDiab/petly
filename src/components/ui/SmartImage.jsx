import { PawPrint } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import Skeleton from './Skeleton';

/** Image with a shimmer while loading, a fade-in, and a friendly fallback. */
export default function SmartImage({ src, alt, className, imgClassName, ...props }) {
  const [status, setStatus] = useState(src ? 'loading' : 'error');

  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {status === 'loading' && <Skeleton className="absolute inset-0" rounded="rounded-none" />}
      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center bg-linear-to-br from-brand-100 to-brand-200 dark:from-surface-2 dark:to-surface">
          <PawPrint className="size-10 text-brand-500/70" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'size-full object-cover transition-all duration-700',
            status === 'loaded' ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm',
            imgClassName,
          )}
          {...props}
        />
      )}
    </div>
  );
}
