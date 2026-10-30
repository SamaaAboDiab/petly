import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AuthHeader,
  FormAlert,
  PasswordStrength,
  SocialButtons,
  staggerContainer,
  staggerItem,
} from '@/components/auth/AuthParts';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input, { PasswordInput } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm } from '@/hooks/useForm';
import { rules } from '@/lib/validators';

const INITIAL = { name: '', email: '', password: '', confirm: '', terms: false };
const SCHEMA = {
  name: [rules.required('Full name'), rules.minLength(3, 'Full name')],
  email: [rules.required('Email'), rules.email()],
  password: [rules.required('Password'), rules.minLength(6, 'Password')],
  confirm: [rules.matches('password', 'Passwords do not match')],
  terms: [rules.checked('Please accept the terms to continue')],
};

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const { values, errors, field, setField, submitting, handleSubmit } = useForm(INITIAL, SCHEMA);
  const [serverError, setServerError] = useState('');

  const onSubmit = async ({ name, email, password }) => {
    setServerError('');
    try {
      await register({ name, email, password });
      toast({ title: 'Account created', description: `Welcome to Petly, ${name.split(' ')[0]}!` });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <AuthHeader title="Create account" subtitle="Join thousands of happy pet families in Egypt." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert message={serverError} />
        <motion.div variants={staggerItem}>
          <Input label="Full name" icon={User} autoComplete="name" placeholder="Ahmed Mohamed" {...field('name')} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <Input label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} />
        </motion.div>
        <motion.div variants={staggerItem} className="space-y-3">
          <PasswordInput label="Password" icon={Lock} autoComplete="new-password" placeholder="At least 6 characters" {...field('password')} />
          <PasswordStrength password={values.password} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <PasswordInput label="Confirm password" icon={Lock} autoComplete="new-password" placeholder="Repeat password" {...field('confirm')} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <Checkbox
            checked={values.terms}
            onChange={(checked) => setField('terms', checked)}
            label={
              <>
                I agree to the <span className="font-semibold text-brand-600 dark:text-brand-300">Terms</span> &{' '}
                <span className="font-semibold text-brand-600 dark:text-brand-300">Privacy Policy</span>
              </>
            }
          />
          {errors.terms && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.terms}</p>}
        </motion.div>

        <motion.div variants={staggerItem} className="pt-2">
          <Button type="submit" size="lg" block loading={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </motion.div>
      </form>

      <SocialButtons />

      <motion.p variants={staggerItem} className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="focus-ring rounded font-bold text-brand-600 hover:underline dark:text-brand-300">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
