import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthHeader, FormAlert, PasswordStrength, staggerContainer, staggerItem } from '@/components/auth/AuthParts';
import Button from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm } from '@/hooks/useForm';
import { rules } from '@/lib/validators';

const INITIAL = { password: '', confirm: '' };
const SCHEMA = {
  password: [rules.required('Password'), rules.minLength(6, 'Password')],
  confirm: [rules.matches('password', 'Passwords do not match')],
};

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const toast = useToast();
  const { values, field, submitting, handleSubmit } = useForm(INITIAL, SCHEMA);
  const [serverError, setServerError] = useState('');

  // On success the session starts and GuestRoute redirects into the app.
  const submit = async ({ password }) => {
    setServerError('');
    try {
      const user = await resetPassword({ token, password });
      toast({ title: 'Password updated', description: `Welcome back, ${user.name.split(' ')[0]}!` });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <AuthHeader title="Set a new password" icon={ShieldCheck} subtitle="Choose a strong password you haven’t used before." />
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <FormAlert message={serverError} />
        {serverError && (
          <Link to="/forgot-password" className="-mt-2 block text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
            Request a new link
          </Link>
        )}
        <motion.div variants={staggerItem} className="space-y-3">
          <PasswordInput label="New password" icon={Lock} autoComplete="new-password" autoFocus {...field('password')} />
          <PasswordStrength password={values.password} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <PasswordInput label="Confirm password" icon={Lock} autoComplete="new-password" {...field('confirm')} />
        </motion.div>
        <motion.div variants={staggerItem} className="pt-2">
          <Button type="submit" size="lg" block loading={submitting}>
            Update password & sign in
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
