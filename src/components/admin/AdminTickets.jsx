import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';
import { usePagedList } from '@/hooks/usePagedList';
import { formatShortDate } from '@/lib/format';
import { adminService } from '@/services/adminService';
import { Pagination } from './AdminShared';

function TicketCard({ ticket, onSaved }) {
  const toast = useToast();
  const [reply, setReply] = useState(ticket.reply ?? '');
  const [saving, setSaving] = useState(false);
  const resolved = ticket.status === 'resolved';

  const save = async (status) => {
    setSaving(true);
    try {
      await adminService.updateTicket(ticket.id, { reply: reply.trim() || null, status });
      toast({ title: status === 'resolved' ? 'Ticket resolved' : 'Ticket reopened', description: 'The user has been notified of your reply' });
      onSaved();
    } catch (error) {
      toast({ title: 'Couldn’t update ticket', description: error.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-3xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-ink">{ticket.subject}</p>
          <p className="text-xs text-muted">
            {ticket.user?.name ?? 'Deleted user'} • {ticket.user?.email} • <span className="capitalize">{ticket.category}</span> •{' '}
            {formatShortDate(ticket.createdAt)}
          </p>
        </div>
        <Badge variant={resolved ? 'success' : 'brand'}>{resolved ? 'Resolved' : 'Open'}</Badge>
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-surface-2 p-3 text-sm text-ink">{ticket.message}</p>

      <label className="mt-4 block text-sm font-semibold text-ink" htmlFor={`reply-${ticket.id}`}>
        Reply
      </label>
      <textarea
        id={`reply-${ticket.id}`}
        value={reply}
        onChange={(e) => setReply(e.target.value.slice(0, 2000))}
        rows={3}
        placeholder="Write a reply the user will see in Help & Support…"
        className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-300/30"
      />
      <div className="mt-3 flex justify-end">
        {resolved ? (
          <Button size="sm" variant="secondary" leftIcon={RotateCcw} loading={saving} onClick={() => save('open')}>
            Reopen
          </Button>
        ) : (
          <Button size="sm" leftIcon={CheckCircle2} loading={saving} disabled={!reply.trim()} onClick={() => save('resolved')}>
            Reply & resolve
          </Button>
        )}
      </div>
    </li>
  );
}

export default function AdminTickets() {
  const [status, setStatus] = useState('open');
  const list = usePagedList(adminService.tickets, { status });
  const tickets = list.data?.tickets ?? [];

  return (
    <div>
      <SegmentedControl
        value={status}
        onChange={(value) => {
          setStatus(value);
          list.setPage(1);
        }}
        className="mb-5 max-w-xs"
        options={[
          { value: 'open', label: 'Open' },
          { value: 'resolved', label: 'Resolved' },
        ]}
      />

      {list.loading && !list.data ? (
        <div className="space-y-4">
          <Skeleton className="h-48" rounded="rounded-3xl" />
          <Skeleton className="h-48" rounded="rounded-3xl" />
        </div>
      ) : tickets.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line py-12 text-center text-sm text-muted">
          {status === 'open' ? 'No open tickets — inbox zero!' : 'No resolved tickets yet.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard key={`${ticket.id}-${ticket.status}`} ticket={ticket} onSaved={list.reload} />
          ))}
        </ul>
      )}
      <Pagination page={list.page} totalPages={list.data?.totalPages ?? 1} onChange={list.setPage} />
    </div>
  );
}
