import { Link } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import Skeleton from '@/components/ui/Skeleton';

export default function BreedCard({ breed }) {
  return (
    <Link to={`/app/pets/${breed.id}`} className="focus-ring group block w-36 shrink-0 rounded-2xl sm:w-auto">
      <SmartImage
        src={breed.image}
        alt={breed.name}
        className="aspect-square rounded-2xl"
        imgClassName="transition-transform !duration-700 group-hover:scale-110 group-hover:rotate-2"
      />
      <p className="mt-2.5 truncate text-sm font-bold text-ink transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-300">
        {breed.name}
      </p>
      <p className="text-xs text-muted">{breed.category}</p>
    </Link>
  );
}

export function BreedCardSkeleton() {
  return (
    <div className="w-36 shrink-0 sm:w-auto">
      <Skeleton className="aspect-square" rounded="rounded-2xl" />
      <Skeleton className="mt-2.5 h-4 w-3/4" />
      <Skeleton className="mt-1.5 h-3 w-1/3" />
    </div>
  );
}
