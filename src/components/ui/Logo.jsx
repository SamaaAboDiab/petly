import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function Logo({ withTagline = true, size = 'md', className, taglineClassName }) {
  const large = size === 'lg';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-2xl bg-brand-400 text-on-brand shadow-glow',
          large ? 'size-14' : 'size-10',
        )}
      >
        <PawPrint className={large ? 'size-8' : 'size-5'} strokeWidth={2.4} />
      </span>
      <div className="leading-tight">
        <p className={cn('font-extrabold tracking-tight text-ink', large ? 'text-4xl' : 'text-2xl')}>Petly</p>
        {withTagline && <p className={cn('whitespace-nowrap text-xs font-medium text-muted', taglineClassName)}>Happy Pets, Happy Homes</p>}
      </div>
    </div>
  );
}
