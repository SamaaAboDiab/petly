import { motion } from 'framer-motion';
import { BadgeCheck, HeartPulse, Truck } from 'lucide-react';

const ITEMS = [
  { icon: BadgeCheck, title: 'Verified sellers', text: 'Every seller is ID-checked' },
  { icon: HeartPulse, title: 'Health checked', text: 'Vet records on every listing' },
  { icon: Truck, title: 'Safe delivery', text: 'Pet-friendly transport' },
];

export default function TrustStrip() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {ITEMS.map(({ icon: Icon, title, text }, i) => (
        <motion.li
          key={title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand-300 hover:shadow-soft"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-600 transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 dark:bg-brand-400/15 dark:text-brand-300">
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{title}</p>
            <p className="text-xs text-muted">{text}</p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
