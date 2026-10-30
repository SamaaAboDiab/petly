import { LifeBuoy, PawPrint, ShoppingBag, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import CategoryIcon from '@/components/pets/CategoryIcon';
import Skeleton from '@/components/ui/Skeleton';
import { CATEGORIES } from '@/data/pets';
import { cn } from '@/lib/cn';
import { useAsync } from '@/hooks/useAsync';
import { useCountUp } from '@/hooks/useCountUp';
import { formatPrice } from '@/lib/format';
import { adminService } from '@/services/adminService';

function StatTile({ icon: Icon, label, value, format = (v) => v.toLocaleString('en-US') }) {
  const [ref, count] = useCountUp(value);
  return (
    <div ref={ref} className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-2xl font-extrabold tabular-nums text-ink">{format(count)}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

const dayLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** Single-series bar chart: one hue, 2px gaps, rounded data-ends, hover tooltip, sr-only table. */
function OrdersChart({ days }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...days.map((d) => d.orders));
  const active = hover !== null ? days[hover] : null;

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="font-bold text-ink">Orders per day</h3>
        <p className="text-xs text-muted">Last 14 days</p>
      </div>

      <div className="relative">
        {active && (
          <div
            className={cn(
              'pointer-events-none absolute top-0 z-10 whitespace-nowrap rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-lift',
              // Keep the tooltip inside the card near either edge.
              hover < 3 ? 'translate-x-0' : hover > days.length - 4 ? '-translate-x-full' : '-translate-x-1/2',
            )}
            style={{ left: `${((hover + 0.5) / days.length) * 100}%` }}
          >
            <p className="font-semibold text-ink">{dayLabel(active.date)}</p>
            <p className="text-muted">
              {active.orders} {active.orders === 1 ? 'order' : 'orders'} • {formatPrice(active.revenue)}
            </p>
          </div>
        )}

        <div className="flex h-44 items-end gap-0.5 border-b border-line" onMouseLeave={() => setHover(null)}>
          {days.map((day, index) => (
            <button
              key={day.date}
              type="button"
              aria-label={`${dayLabel(day.date)}: ${day.orders} orders`}
              onMouseEnter={() => setHover(index)}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(null)}
              className="focus-ring group flex h-full flex-1 items-end rounded-t"
            >
              <span
                className="block w-full rounded-t bg-brand-400 transition-[height,opacity] duration-500 group-hover:opacity-80"
                style={{ height: day.orders ? `${(day.orders / max) * 100}%` : '2px', opacity: day.orders ? 1 : 0.35 }}
              />
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted">
          <span>{dayLabel(days[0].date)}</span>
          <span>{dayLabel(days.at(-1).date)}</span>
        </div>
      </div>

      <table className="sr-only">
        <caption>Orders per day, last 14 days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.orders}</td>
              <td>{d.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CategoryBars({ categories }) {
  const total = Math.max(1, categories.reduce((sum, c) => sum + c.count, 0));
  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h3 className="mb-5 font-bold text-ink">Listings by category</h3>
      <ul className="space-y-4">
        {CATEGORIES.filter((c) => c.id !== 'all').map(({ id, label }) => {
          const count = categories.find((c) => c.id === id)?.count ?? 0;
          return (
            <li key={id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <CategoryIcon category={id} className="size-4 text-muted" /> {label}
                </span>
                <span className="tabular-nums text-muted">{count}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-brand-400 transition-[width] duration-700" style={{ width: `${(count / total) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function AdminOverview() {
  const { data, loading } = useAsync(() => adminService.stats(), []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-36" rounded="rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-72" rounded="rounded-3xl" />
      </div>
    );
  }

  const { totals, ordersByDay, petsByCategory, recentOrders } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile icon={Users} label="Users" value={totals.users} />
        <StatTile icon={PawPrint} label="Listings" value={totals.pets} />
        <StatTile icon={ShoppingBag} label="Orders" value={totals.orders} />
        <StatTile icon={Wallet} label="Revenue" value={totals.revenue} format={formatPrice} />
        <StatTile icon={LifeBuoy} label="Open tickets" value={totals.openTickets} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <OrdersChart days={ordersByDay} />
        <CategoryBars categories={petsByCategory} />
      </div>

      <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
        <h3 className="mb-4 font-bold text-ink">Recent orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold text-ink">#{order.orderNumber}</span>
                  <span className="text-muted"> • {order.buyer} • {order.items} {order.items === 1 ? 'pet' : 'pets'}</span>
                </span>
                <span className="shrink-0 font-bold tabular-nums text-ink">{formatPrice(order.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
