import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import { cn } from '@/lib/cn';

export default function PromoBanner({ title, description, image, icon: Icon, to, className }) {
  return (
    <Link
      to={to}
      className={cn(
        'focus-ring group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-linear-to-r from-brand-100 to-brand-200 p-4 pr-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:from-brand-400/15 dark:to-brand-400/5',
        className,
      )}
    >
      <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/40 blur-2xl transition-transform duration-700 group-hover:scale-150 dark:bg-brand-400/10" />
      {image ? (
        <SmartImage
          src={image}
          alt=""
          className="size-20 shrink-0 rounded-2xl"
          imgClassName="transition-transform !duration-700 group-hover:scale-110 group-hover:-rotate-3"
        />
      ) : (
        Icon && (
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-400 text-on-brand">
            <Icon className="size-7" />
          </span>
        )
      )}
      <div className="relative min-w-0 flex-1">
        <p className="font-bold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-ink/65 dark:text-muted">{description}</p>
      </div>
      <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-brand-400 text-on-brand shadow-glow transition-transform duration-300 group-hover:translate-x-1">
        <ChevronRight className="size-5" strokeWidth={2.6} />
      </span>
    </Link>
  );
}
