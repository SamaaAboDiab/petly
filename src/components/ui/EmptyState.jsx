import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface px-6 py-14 text-center',
        className,
      )}
    >
      <div className="relative mb-5">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand-300/30" />
        <span className="relative grid size-20 place-items-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
          <Icon className="size-9" />
        </span>
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
