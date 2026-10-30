import { useCountUp } from '@/hooks/useCountUp';

export default function StatCard({ value, label }) {
  const [ref, count] = useCountUp(value);
  return (
    <div ref={ref} className="flex-1 px-2 py-4 text-center">
      <p className="text-2xl font-extrabold tabular-nums text-ink">{count}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}
