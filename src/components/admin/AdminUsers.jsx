import { useState } from 'react';
import UserAvatar from '@/components/layout/UserAvatar';
import Badge from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePagedList } from '@/hooks/usePagedList';
import { formatShortDate } from '@/lib/format';
import { adminService } from '@/services/adminService';
import { ConfirmDialog, DataTable, DeleteButton, Pagination, SearchBox } from './AdminShared';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const list = usePagedList(adminService.users);
  // Local overrides so switches react instantly without refetching the page.
  const [verifiedOverride, setVerifiedOverride] = useState({});
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggleVerified = async (user, verified) => {
    setVerifiedOverride((map) => ({ ...map, [user.id]: verified }));
    try {
      await adminService.setVerified(user.id, verified);
      toast({ title: verified ? `${user.name} is now verified` : `Removed verification from ${user.name}` });
    } catch (error) {
      setVerifiedOverride((map) => ({ ...map, [user.id]: !verified }));
      toast({ title: 'Couldn’t update user', description: error.message, variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteUser(toDelete.id);
      toast({ title: 'User deleted', description: `${toDelete.name} and their listings were removed`, variant: 'info' });
      setToDelete(null);
      list.reload();
    } catch (error) {
      toast({ title: 'Couldn’t delete user', description: error.message, variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const users = list.data?.users ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBox value={list.search} onChange={list.setSearch} placeholder="Search by name or email" />
        {list.data && <p className="text-sm text-muted">{list.data.total} users</p>}
      </div>

      <DataTable columns={['User', 'Role', 'Listings', 'Joined', 'Verified', '']} loading={list.loading && !list.data} empty={users.length === 0 && 'No users match your search.'}>
        {users.map((user) => {
          const verified = verifiedOverride[user.id] ?? user.verified;
          const isMe = user.id === me?.id;
          return (
            <tr key={user.id} className="transition-colors hover:bg-surface-2/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} className="size-9 ring-0" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={user.role === 'admin' ? 'solid' : 'neutral'}>{user.role}</Badge>
              </td>
              <td className="px-4 py-3 tabular-nums text-ink">{user.listings}</td>
              <td className="px-4 py-3 text-muted">{formatShortDate(user.createdAt)}</td>
              <td className="px-4 py-3">
                <Switch checked={verified} onChange={(v) => toggleVerified(user, v)} label={`Verify ${user.name}`} />
              </td>
              <td className="px-4 py-3">{!isMe && <DeleteButton label={`Delete ${user.name}`} onClick={() => setToDelete(user)} />}</td>
            </tr>
          );
        })}
      </DataTable>
      <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.name ?? 'user'}?`}
        message="Their account, listings and cart are removed for good. Orders and chats stay as history."
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
