import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, KeyRound, Mail, MailCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthHeader, FormAlert, staggerContainer, staggerItem } from '@/components/auth/AuthParts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useForm } from '@/hooks/useForm';
import { rules } from '@/lib/validators';
import { authService } from '@/services/authService';

const SCHEMA = { email: [rules.required('Email'), rules.email()] };
const RESEND_COOLDOWN_S = 30;

export default function ForgotPasswordPage() {
  const { values, field, submitting, handleSubmit } = useForm({ email: '' }, SCHEMA);
  const [sentTo, setSentTo] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [serverError, setServerError] = useState('');

  // Ticks the resend cooldown down; the timer is cleared on unmount.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = () => setCooldown(RESEND_COOLDOWN_S);

  const send = async ({ email }) => {
    setServerError('');
    try {
      await authService.forgotPassword(email);
      setSentTo(email);
      startCooldown();
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <motion.div variants={staggerItem}>
        <Link to="/login" className="focus-ring group mb-8 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> Back to sign in
        </Link>
      </motion.div>

      <AnimatePresence mode="wait">
        {sentTo ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span className="on-brand grid size-16 place-items-center rounded-2xl bg-brand-400 text-ink shadow-glow">
              <MailCheck className="size-8" />
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">Check your inbox</h1>
            <p className="mt-2 text-muted">
              If an account exists for <span className="font-semibold text-ink">{sentTo}</span>, we’ve sent a link to reset
              your password. It expires in 30 minutes.
            </p>
            <div className="mt-8 space-y-3">
              <Button size="lg" block variant="secondary" onClick={() => send({ email: sentTo })} disabled={cooldown > 0} loading={submitting}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
              </Button>
              <button type="button" onClick={() => setSentTo(null)} className="focus-ring w-full rounded-lg text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
                Use a different email
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <AuthHeader title="Forgot password?" icon={KeyRound} subtitle="Enter your email and we’ll send you a reset link." />
            <form onSubmit={handleSubmit(send)} noValidate className="space-y-4">
              <FormAlert message={serverError} />
              <motion.div variants={staggerItem}>
                <Input label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" autoFocus {...field('email')} />
              </motion.div>
              <motion.div variants={staggerItem} className="pt-2">
                <Button type="submit" size="lg" block loading={submitting} disabled={!values.email}>
                  Send reset link
                </Button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
