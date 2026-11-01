import { FileText, HeartPulse, Pill, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

const FEATURES = [
  { key: 'vaccinated', label: 'Vaccinated', icon: ShieldCheck },
  { key: 'dewormed', label: 'Dewormed', icon: Pill },
  { key: 'healthCheck', label: 'Health Check', icon: HeartPulse },
  { key: 'pedigree', label: 'Pedigree', icon: FileText },
];

export default function HealthFeatures({ features }) {
  return (
    <ul className="grid grid-cols-4 gap-2 sm:gap-3">
      {FEATURES.map(({ key, label, icon: Icon }) => {
        const enabled = features?.[key];
        return (
          <li
            key={key}
            className={cn(
              'group flex flex-col items-center gap-2 rounded-2xl border px-1 py-3 text-center text-[11px] font-semibold leading-tight transition-all duration-300 sm:p-4 sm:text-xs',
              enabled
                ? 'border-line bg-surface text-ink hover:-translate-y-1 hover:border-brand-300 hover:shadow-soft'
                : 'border-dashed border-line bg-transparent text-muted line-through opacity-60',
            )}
          >
            <Icon
              className={cn(
                'size-6 transition-transform duration-300',
                enabled && 'text-brand-600 group-hover:scale-125 dark:text-brand-300',
              )}
            />
            {label}
          </li>
        );
      })}
    </ul>
  );
}
