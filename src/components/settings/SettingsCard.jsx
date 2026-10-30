import { motion } from 'framer-motion';

export default function SettingsCard({ id, icon: Icon, title, description, children, delay = 0 }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="scroll-mt-28 rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7"
    >
      <header className="mb-6 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      </header>
      {children}
    </motion.section>
  );
}
