import Skeleton from '@/components/ui/Skeleton';

export default function PetCardSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-surface p-2.5">
      <Skeleton className="aspect-[4/3.4]" rounded="rounded-2xl" />
      <div className="space-y-2.5 px-1.5 pb-1 pt-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-9" />
        </div>
      </div>
    </div>
  );
}
