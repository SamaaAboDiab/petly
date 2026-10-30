import { BadgeCheck, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SmartImage from '@/components/ui/SmartImage';
import { useToast } from '@/context/ToastContext';
import { usePagedList } from '@/hooks/usePagedList';
import { formatPrice, formatShortDate } from '@/lib/format';
import { adminService } from '@/services/adminService';
import { ConfirmDialog, DataTable, DeleteButton, Pagination, SearchBox } from './AdminShared';

export default function AdminListings() {
  const toast = useToast();
  const list = usePagedList(adminService.pets);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deletePet(toDelete.id);
      toast({ title: 'Listing removed', description: toDelete.name, variant: 'info' });
      setToDelete(null);
      list.reload();
    } catch (error) {
      toast({ title: 'Couldn’t remove listing', description: error.message, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const pets = list.data?.pets ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBox value={list.search} onChange={list.setSearch} placeholder="Search by breed or city" />
        {list.data && <p className="text-sm text-muted">{list.data.total} listings</p>}
      </div>

      <DataTable columns={['Pet', 'Category', 'Price', 'Seller', 'Listed', '']} loading={list.loading && !list.data} empty={pets.length === 0 && 'No listings match your search.'}>
        {pets.map((pet) => (
          <tr key={pet.id} className="transition-colors hover:bg-surface-2/60">
            <td className="px-4 py-3">
              <Link to={`/app/pets/${pet.slug}`} className="focus-ring group flex items-center gap-3 rounded-xl">
                <SmartImage src={pet.images[0]} alt="" className="size-11 shrink-0 rounded-xl" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1 truncate font-semibold text-ink group-hover:text-brand-600 dark:group-hover:text-brand-300">
                    {pet.name} <ExternalLink className="size-3 opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="block truncate text-xs text-muted">{pet.location}</span>
                </span>
              </Link>
            </td>
            <td className="px-4 py-3 capitalize text-ink">{pet.category}</td>
            <td className="px-4 py-3 font-semibold tabular-nums text-ink">{formatPrice(pet.price)}</td>
            <td className="px-4 py-3">
              <span className="flex items-center gap-1 text-ink">
                {pet.seller?.name ?? '—'}
                {pet.seller?.verified && <BadgeCheck className="size-4 fill-brand-400 text-white" />}
              </span>
            </td>
            <td className="px-4 py-3 text-muted">{formatShortDate(pet.createdAt)}</td>
            <td className="px-4 py-3">
              <DeleteButton label={`Remove ${pet.name}`} onClick={() => setToDelete(pet)} />
            </td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Remove “${toDelete?.name ?? ''}”?`}
        message="The listing disappears for everyone, including favorites and carts."
        confirmLabel="Remove"
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
