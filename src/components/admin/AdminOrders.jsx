import { useState } from 'react';
import { STATUS_BADGE } from '@/components/orders/OrderCard';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { usePagedList } from '@/hooks/usePagedList';
import { formatPrice, formatShortDate } from '@/lib/format';
import { adminService } from '@/services/adminService';
import { DataTable, Pagination } from './AdminShared';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function Person({ user }) {
  if (!user) return <span className="text-muted">Deleted user</span>;
  return (
    <>
      <p className="text-ink">{user.name}</p>
      <p className="text-xs text-muted">{user.email}</p>
    </>
  );
}

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const list = usePagedList(adminService.orders, { status: status || undefined });
  const orders = list.data?.orders ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <SegmentedControl
            value={status}
            onChange={(value) => {
              setStatus(value);
              list.setPage(1);
            }}
            className="min-w-[480px]"
            options={FILTERS}
          />
        </div>
        {list.data && <p className="text-sm text-muted">{list.data.total} orders</p>}
      </div>

      <DataTable
        columns={['Order', 'Buyer', 'Seller', 'Pets', 'Total', 'Status', 'Date']}
        loading={list.loading && !list.data}
        empty={orders.length === 0 && (status ? `No ${status} orders.` : 'No orders yet.')}
      >
        {orders.map((order) => {
          const badge = STATUS_BADGE[order.status] ?? STATUS_BADGE.pending;
          return (
            <tr key={order.id} className="transition-colors hover:bg-surface-2/60">
              <td className="px-4 py-3 font-semibold text-ink">#{order.orderNumber}</td>
              <td className="px-4 py-3">
                <Person user={order.user} />
              </td>
              <td className="px-4 py-3">
                <Person user={order.seller} />
              </td>
              <td className="px-4 py-3 text-ink">{order.items.map((item) => item.name).join(', ')}</td>
              <td className="px-4 py-3">
                <p className="font-bold tabular-nums text-ink">{formatPrice(order.total)}</p>
                {order.promoCode && <p className="text-xs text-emerald-600">{order.promoCode}</p>}
              </td>
              <td className="px-4 py-3">
                {/* Admin wording: say who the order is waiting on. */}
                <Badge variant={badge.variant}>{order.status === 'pending' ? 'Pending' : badge.label}</Badge>
              </td>
              <td className="px-4 py-3 text-muted">{formatShortDate(order.createdAt)}</td>
            </tr>
          );
        })}
      </DataTable>
      <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />
    </div>
  );
}
