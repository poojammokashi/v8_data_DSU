import { useState } from 'react';
import { HiChevronUp, HiChevronDown, HiOutlineInbox } from 'react-icons/hi2';
import { cn } from '@utils/cn';
import Skeleton from '@components/ui/Skeleton';
import EmptyState from '@components/ui/EmptyState';
import TablePagination from './TablePagination';

/**
 * DataTable — the single reusable table used across Power Purchase, Open Access,
 * Billing, Users, Alerts, etc.
 *
 * @param {Array} columns - [{ key, header, render?(row), sortable?, align?, width? }]
 * @param {Array} data
 * @param {boolean} isLoading
 * @param {string} emptyTitle / emptyDescription
 * @param {Object} pagination - { page, pageSize, total, onPageChange }
 * @param {Object} sort - { sortBy, sortOrder, onSortChange(key) }
 * @param {Function} onRowClick
 * @param {Function} rowKey - (row) => unique id
 */
export default function DataTable({
  columns,
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or date range.',
  pagination,
  sort,
  onRowClick,
  rowKey = (row) => row.id,
  className,
}) {
  const [internalSort, setInternalSort] = useState({ sortBy: null, sortOrder: 'asc' });
  const activeSort = sort || internalSort;

  function handleSort(key) {
    if (sort?.onSortChange) {
      sort.onSortChange(key);
    } else {
      setInternalSort((prev) => ({
        sortBy: key,
        sortOrder: prev.sortBy === key && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop / tablet table view */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-subtle">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-3 text-left text-2xs font-semibold uppercase tracking-wide text-ink-muted whitespace-nowrap',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center'
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-ink transition-colors"
                    >
                      {col.header}
                      <span className="flex flex-col -space-y-1">
                        <HiChevronUp
                          className={cn(
                            'h-3 w-3',
                            activeSort.sortBy === col.key && activeSort.sortOrder === 'asc'
                              ? 'text-amber-500'
                              : 'text-ink-faint/50'
                          )}
                        />
                        <HiChevronDown
                          className={cn(
                            'h-3 w-3',
                            activeSort.sortBy === col.key && activeSort.sortOrder === 'desc'
                              ? 'text-amber-500'
                              : 'text-ink-faint/50'
                          )}
                        />
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border-subtle last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={HiOutlineInbox}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            )}

            {!isLoading &&
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'border-b border-border-subtle last:border-0 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-subtle'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3.5 text-ink whitespace-nowrap',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-subtle bg-surface-raised p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}

        {!isLoading && data.length === 0 && (
          <EmptyState icon={HiOutlineInbox} title={emptyTitle} description={emptyDescription} />
        )}

        {!isLoading &&
          data.map((row) => (
            <div
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'rounded-2xl border border-border-subtle bg-surface-raised p-4 shadow-soft space-y-2',
                onRowClick && 'cursor-pointer active:scale-[0.99] transition-transform'
              )}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3">
                  <span className="text-2xs font-medium uppercase tracking-wide text-ink-faint">
                    {col.header}
                  </span>
                  <span className="text-sm text-ink text-right">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              ))}
            </div>
          ))}
      </div>

      {pagination && !isLoading && data.length > 0 && (
        <TablePagination {...pagination} className="mt-4" />
      )}
    </div>
  );
}
