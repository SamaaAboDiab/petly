import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="flex h-11 w-full max-w-sm items-center gap-2 rounded-2xl border border-line bg-surface px-4 text-sm transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-300/30">
      <Search className="size-4 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted">
      <span>
        Page {page} of {totalPages}
      </span>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)} className="focus-ring grid size-9 place-items-center rounded-xl border border-line hover:text-ink disabled:opacity-40">
        <ChevronLeft className="size-4" />
      </button>
      <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="focus-ring grid size-9 place-items-center rounded-xl border border-line hover:text-ink disabled:opacity-40">
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/** Horizontally scrollable table shell with a skeleton and an empty state. */
export function DataTable({ columns, loading, empty, children }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-soft">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className={cn('px-4 py-3 font-semibold', column === '' && 'w-px')}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={columns.length} className="px-4 py-3">
                    <Skeleton className="h-8" />
                  </td>
                </tr>
              ))
            : children}
        </tbody>
      </table>
      {!loading && empty && <p className="px-4 py-10 text-center text-sm text-muted">{empty}</p>}
    </div>
  );
}

export function DeleteButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="focus-ring grid size-9 place-items-center rounded-xl text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={title} className="max-w-sm">
      <div className="p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
          <Trash2 className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={busy} className="bg-red-500 text-white shadow-none hover:bg-red-600">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
