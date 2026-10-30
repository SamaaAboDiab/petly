import { Camera, MapPin, Trash2, User, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormAlert } from '@/components/auth/AuthParts';
import UserAvatar from '@/components/layout/UserAvatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useForm } from '@/hooks/useForm';
import { rules } from '@/lib/validators';
import { accountService } from '@/services/accountService';
import SettingsCard from './SettingsCard';

const SCHEMA = {
  name: [rules.required('Name'), rules.minLength(3, 'Name')],
  location: [rules.required('Location')],
};
const MAX_AVATAR = 5 * 1024 * 1024;

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const initial = useMemo(() => ({ name: user.name, location: user.location ?? '' }), [user.name, user.location]);
  const { values, field, submitting, handleSubmit, setErrors } = useForm(initial, SCHEMA);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [serverError, setServerError] = useState('');
  const fileRef = useRef(null);

  const preview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shownAvatar = preview ?? (removeAvatar ? null : user.avatar);
  const dirty =
    values.name !== user.name || values.location !== (user.location ?? '') || Boolean(avatarFile) || removeAvatar;

  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > MAX_AVATAR) {
      toast({ title: 'Photo not accepted', description: 'Use a JPG, PNG or WEBP under 5MB', variant: 'error' });
      return;
    }
    setAvatarFile(file);
    setRemoveAvatar(false);
  };

  const save = async (formValues) => {
    setServerError('');
    try {
      const updated = await accountService.updateProfile({ ...formValues, avatar: avatarFile, removeAvatar });
      updateUser(updated);
      setAvatarFile(null);
      setRemoveAvatar(false);
      toast({ title: 'Profile updated' });
    } catch (error) {
      setErrors(Object.fromEntries(error.errors?.map((e) => [e.field, e.message]) ?? []));
      setServerError(error.message);
    }
  };

  return (
    <SettingsCard id="profile" icon={UserRound} title="Profile" description="How buyers and sellers see you.">
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-5">
        <FormAlert message={serverError} />

        <div className="flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="focus-ring group relative rounded-full"
            aria-label="Change profile photo"
          >
            <UserAvatar user={{ ...user, avatar: shownAvatar }} className="size-24 text-2xl ring-4" />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="size-6" />
            </span>
          </button>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" leftIcon={Camera} onClick={() => fileRef.current?.click()}>
                Upload photo
              </Button>
              {shownAvatar && (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={Trash2}
                  onClick={() => {
                    setAvatarFile(null);
                    setRemoveAvatar(true);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted">JPG, PNG or WEBP, up to 5MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(e) => {
              pickFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" icon={User} autoComplete="name" {...field('name')} />
          <Input label="Location" icon={MapPin} placeholder="Cairo, Egypt" {...field('location')} />
        </div>
        <Input label="Email" value={user.email} readOnly disabled hint="Email can’t be changed." inputClassName="opacity-70" />

        <div className="flex justify-end">
          <Button type="submit" loading={submitting} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
