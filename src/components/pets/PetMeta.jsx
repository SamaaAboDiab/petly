import { CalendarHeart, MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';

/** `withIcon`: leading icon, as in the list rows of the design. */
export function PetAgeGender({ pet, withIcon = false, className }) {
  return (
    <p className={cn('flex items-center gap-1.5 text-xs text-muted', className)}>
      {withIcon && <CalendarHeart className="-mr-0.5 size-3.5 shrink-0" />}
      {pet.age}
      <span className="size-1 rounded-full bg-muted/60" />
      {pet.gender}
    </p>
  );
}

export function PetLocation({ location, className }) {
  return (
    <p className={cn('flex items-center gap-1 text-xs text-muted', className)}>
      <MapPin className="size-3.5 shrink-0" />
      <span className="truncate">{location}</span>
    </p>
  );
}
