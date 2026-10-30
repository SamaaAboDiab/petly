import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export default function SectionHeader({ title, subtitle, actionLabel = 'See All', to, action, className }) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action ??
        (to && (
          <Link
            to={to}
            className="focus-ring group inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-brand-600 dark:text-brand-300"
          >
            {actionLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
    </div>
  );
}
