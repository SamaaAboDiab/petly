import { motion } from 'framer-motion';
import { Hand, Lock, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthHeader, FormAlert, SocialButtons, staggerContainer, staggerItem } from '@/components/auth/AuthParts';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input, { PasswordInput } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm } from '@/hooks/useForm';
import { rules } from '@/lib/validators';
import { DEMO_USER } from '@/services/authService';

const INITIAL = { email: '', password: '' };
const SCHEMA = {
  email: [rules.required('Email'), rules.email()],
  password: [rules.required('Password'), rules.minLength(6, 'Password')],
};

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const { field, setValues, submitting, handleSubmit } = useForm(INITIAL, SCHEMA);
  const [remember, setRemember] = useState(true);
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const user = await login(values, { remember });
      toast({ title: `Welcome back, ${user.name.split(' ')[0]}!`, description: 'Let’s find your perfect pet' });
    } catch (error) {
      setServerError(error.message);
    }
  };

  const fillDemo = () => {
    setServerError('');
    setValues({ email: DEMO_USER.email, password: DEMO_USER.password });
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show">
      <AuthHeader title="Welcome back" icon={Hand}subtitle="Sign in to continue finding your perfect companion." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormAlert message={serverError} />
        <motion.div variants={staggerItem}>
          <Input label="Email" icon={Mail} type="email" autoComplete="email" placeholder="you@example.com" {...field('email')} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <PasswordInput label="Password" icon={Lock} autoComplete="current-password" placeholder="••••••••" {...field('password')} />
        </motion.div>

        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
          <Link
            to="/forgot-password"
            className="focus-ring rounded text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-3 pt-2">
          <Button type="submit" size="lg" block loading={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
          <Button variant="secondary" size="lg" block leftIcon={Sparkles} onClick={fillDemo}>
            Use demo account
          </Button>
        </motion.div>
      </form>

      <SocialButtons />

      <motion.p variants={staggerItem} className="mt-8 text-center text-sm text-muted">
        New to Petly?{' '}
        <Link to="/register" className="focus-ring rounded font-bold text-brand-600 hover:underline dark:text-brand-300">
          Create an account
        </Link>
      </motion.p>
    </motion.div>
  );
}
