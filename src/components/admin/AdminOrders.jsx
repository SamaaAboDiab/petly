import Badge from '@/components/ui/Badge';
import { usePagedList } from '@/hooks/usePagedList';
import { formatPrice, formatShortDate } from '@/lib/format';
import { adminService } from '@/services/adminService';
import { DataTable, Pagination } from './AdminShared';

export default function AdminOrders() {
  const list = usePagedList(adminService.orders);
  const orders = list.data?.orders ?? [];

  return (
    <div>
      {list.data && <p className="mb-4 text-sm text-muted">{list.data.total} orders</p>}
      <DataTable columns={['Order', 'Buyer', 'Pets', 'Discount', 'Total', 'Date']} loading={list.loading && !list.data} empty={orders.length === 0 && 'No orders yet.'}>
        {orders.map((order) => (
          <tr key={order.id} className="transition-colors hover:bg-surface-2/60">
            <td className="px-4 py-3 font-semibold text-ink">#{order.orderNumber}</td>
            <td className="px-4 py-3">
              <p className="text-ink">{order.user?.name ?? 'Deleted user'}</p>
              <p className="text-xs text-muted">{order.user?.email}</p>
            </td>
            <td className="px-4 py-3 text-ink">{order.items.map((item) => item.name).join(', ')}</td>
            <td className="px-4 py-3">{order.promoCode ? <Badge>{order.promoCode}</Badge> : <span className="text-muted">—</span>}</td>
            <td className="px-4 py-3 font-bold tabular-nums text-ink">{formatPrice(order.total)}</td>
            <td className="px-4 py-3 text-muted">{formatShortDate(order.createdAt)}</td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />
    </div>
  );
}
