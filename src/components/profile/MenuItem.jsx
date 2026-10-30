import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function MenuItem({ icon: Icon, label, badge, trailing, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-surface-2 transition-all duration-300 group-hover:bg-brand-400 group-hover:text-on-brand">
        <Icon className="size-5" />
      </span>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="grid size-6 place-items-center rounded-full bg-brand-400 text-xs font-bold text-on-brand">{badge}</span>
      )}
      {trailing ?? (
        <ChevronRight className={cn('size-4 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink')} />
      )}
    </button>
  );
}
