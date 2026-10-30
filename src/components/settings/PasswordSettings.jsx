import { KeyRound, Lock } from 'lucide-react';
import { useState } from 'react';
import { FormAlert, PasswordStrength } from '@/components/auth/AuthParts';
import Button from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useForm } from '@/hooks/useForm';
import { rules } from '@/lib/validators';
import { accountService } from '@/services/accountService';
import SettingsCard from './SettingsCard';

const INITIAL = { currentPassword: '', newPassword: '', confirm: '' };
const SCHEMA = {
  currentPassword: [rules.required('Current password')],
  newPassword: [rules.required('New password'), rules.minLength(6, 'New password')],
  confirm: [rules.matches('newPassword', 'Passwords do not match')],
};

export default function PasswordSettings() {
  const toast = useToast();
  const { values, field, submitting, handleSubmit, setErrors, reset } = useForm(INITIAL, SCHEMA);
  const [serverError, setServerError] = useState('');

  const save = async ({ currentPassword, newPassword }) => {
    setServerError('');
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      reset();
      toast({ title: 'Password updated', description: 'Use your new password next time you sign in' });
    } catch (error) {
      setErrors(Object.fromEntries(error.errors?.map((e) => [e.field, e.message]) ?? []));
      if (!error.errors?.length) setServerError(error.message);
    }
  };

  return (
    <SettingsCard id="password" icon={KeyRound} title="Password" description="Use at least 6 characters." delay={0.05}>
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <FormAlert message={serverError} />
        <PasswordInput label="Current password" icon={Lock} autoComplete="current-password" {...field('currentPassword')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <PasswordInput label="New password" icon={Lock} autoComplete="new-password" {...field('newPassword')} />
            <PasswordStrength password={values.newPassword} />
          </div>
          <PasswordInput label="Confirm new password" icon={Lock} autoComplete="new-password" {...field('confirm')} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={submitting}>
            Update password
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
