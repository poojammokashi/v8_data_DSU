import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { cn } from '@utils/cn';

export default function TablePagination({ page, pageSize, total, onPageChange, className }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      <p className="text-xs text-ink-muted tabular">
        Showing <span className="text-ink font-medium">{startItem}–{endItem}</span> of{' '}
        <span className="text-ink font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-ink-muted hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs text-ink-muted px-2 tabular">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-ink-muted hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
