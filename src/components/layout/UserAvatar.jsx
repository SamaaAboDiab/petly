import { PawPrint } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

/** Photo when the user has one, otherwise initials on the brand gradient. */
export default function UserAvatar({ user, className }) {
  const base = cn('size-11 shrink-0 rounded-full ring-4 ring-surface', className);

  if (user?.avatar) {
    return <SmartImage src={user.avatar} alt={user.name} className={base} />;
  }

  return (
    <span
      className={cn(
        'grid place-items-center bg-linear-to-br from-brand-300 to-brand-500 font-bold text-on-brand',
        base,
      )}
    >
      {initials(user?.name) || <PawPrint className="size-1/2" />}
    </span>
  );
}
