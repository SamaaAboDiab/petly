import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/cn';
import { passwordStrength } from '@/lib/validators';

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function AuthHeader({ title, subtitle, icon: Icon }) {
  return (
    <motion.div variants={staggerItem} className="mb-8">
      <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        {title}
        {Icon && (
          <motion.span
            animate={{ rotate: [0, 18, -8, 18, 0] }}
            transition={{ duration: 1.2, delay: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
            className="on-brand grid size-10 origin-bottom-right place-items-center rounded-2xl bg-brand-400 text-ink sm:size-11"
          >
            <Icon className="size-5 sm:size-6" />
          </motion.span>
        )}
      </h1>
      <p className="mt-2 text-muted">{subtitle}</p>
    </motion.div>
  );
}

export function FormAlert({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <p className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="size-4 shrink-0" /> {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
    <path d="M16.37 1.43c0 1.14-.42 2.2-1.25 3.06-.9.93-1.98 1.47-3.15 1.38a3.2 3.2 0 0 1-.02-.4c0-1.1.48-2.28 1.33-3.15.42-.44.96-.8 1.6-1.09.64-.28 1.25-.43 1.82-.46.02.22.03.44.03.66zm4.19 15.85c-.32.75-.7 1.44-1.14 2.07-.6.86-1.1 1.46-1.48 1.79-.59.54-1.22.82-1.9.84-.48 0-1.07-.14-1.75-.42-.69-.28-1.32-.42-1.9-.42-.6 0-1.26.14-1.95.42-.7.28-1.26.43-1.69.44-.65.03-1.3-.26-1.94-.86-.42-.36-.94-.99-1.56-1.88a12.9 12.9 0 0 1-1.65-3.28A12 12 0 0 1 2.9 12c0-1.44.31-2.68.93-3.72a5.47 5.47 0 0 1 4.58-2.7c.51 0 1.18.16 2.01.47.83.31 1.36.47 1.6.47.17 0 .76-.18 1.76-.55.94-.34 1.74-.48 2.4-.43 1.77.14 3.1.84 3.98 2.1-1.58.96-2.37 2.3-2.35 4.03.01 1.34.5 2.46 1.46 3.35.43.41.92.73 1.45.95-.12.34-.24.67-.37.99z" />
  </svg>
);

export function SocialButtons() {
  const toast = useToast();
  const comingSoon = (provider) => () =>
    toast({ title: `${provider} sign-in`, description: 'Coming soon — use email for now', variant: 'info' });

  return (
    <motion.div variants={staggerItem}>
      <div className="my-6 flex items-center gap-3 text-xs font-medium text-muted">
        <span className="h-px flex-1 bg-line" /> or continue with <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Google', Icon: GoogleIcon },
          { name: 'Apple', Icon: AppleIcon },
        ].map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={comingSoon(name)}
            className="focus-ring flex h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-surface text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
          >
            <Icon /> {name}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

const STRENGTH = [
  { label: 'Too weak', color: 'bg-red-400' },
  { label: 'Weak', color: 'bg-orange-400' },
  { label: 'Fair', color: 'bg-brand-400' },
  { label: 'Good', color: 'bg-lime-500' },
  { label: 'Strong', color: 'bg-emerald-500' },
];

export function PasswordStrength({ password }) {
  if (!password) return null;
  const score = passwordStrength(password);
  return (
    <div className="-mt-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <motion.span
              className={cn('block h-full rounded-full', STRENGTH[score].color)}
              initial={false}
              animate={{ width: score >= step ? '100%' : '0%' }}
            />
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Password strength: <span className="font-semibold text-ink">{STRENGTH[score].label}</span>
      </p>
    </div>
  );
}
