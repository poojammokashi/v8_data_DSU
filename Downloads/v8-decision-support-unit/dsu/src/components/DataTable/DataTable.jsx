import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { SearchBar } from '../SearchBar/SearchBar.jsx';
import { FilterBar } from '../FilterBar/FilterBar.jsx';
import { ExportButton } from '../ExportButton/ExportButton.jsx';
import { EmptyState } from '../EmptyState/EmptyState.jsx';
import { useTableControls } from '../../hooks/useTableControls.js';
import { formatNumber, statusTone, isStatusColumn } from '../../utils/format.js';

const TONE_BADGE = {
  critical: 'bg-red-500/10 text-status-critical',
  warning: 'bg-amber-500/10 text-status-warning',
  normal: 'bg-emerald-500/10 text-status-normal',
  info: 'bg-blue-500/10 text-status-info',
  neutral: 'bg-slate-500/10 text-status-neutral'
};

export function DataTable({ title, headers, records, exportName = 'export', enableFilters = true }) {
  const {
    search,
    setSearch,
    filters,
    updateFilter,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    pageRows,
    filteredCount,
    filteredRows
  } = useTableControls(records, headers);

  const filterableColumns = enableFilters ? headers.filter((h) => isStatusColumn(h)) : [];

  return (
    <div className="card p-4 flex flex-col gap-3 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-light dark:text-ink-dark">{title}</h3>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
            {filteredCount} of {records.length} records
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search records…" className="w-full sm:w-56" />
          <ExportButton filename={exportName} headers={headers} records={filteredRows} />
        </div>
      </div>

      <FilterBar filterableColumns={filterableColumns} records={records} filters={filters} onChange={updateFilter} />

      {records.length === 0 ? (
        <EmptyState variant="empty" title="No records in this table" />
      ) : filteredCount === 0 ? (
        <EmptyState variant="search" title="No matches" description="Try a different search term or clear your filters." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border-light dark:border-border-dark">
            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02]">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      onClick={() => toggleSort(h)}
                      className="cursor-pointer select-none whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark"
                    >
                      <span className="flex items-center gap-1">
                        {h}
                        {sort.key === h ? (
                          sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {pageRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                    {headers.map((h) => (
                      <td key={h} className="whitespace-nowrap px-3 py-2 text-ink-light dark:text-ink-dark">
                        {renderCell(h, row[h])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-light dark:text-muted-dark">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                className="btn-secondary py-1 px-2"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                className="btn-secondary py-1 px-2"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function renderCell(header, value) {
  if (isStatusColumn(header) && value !== '' && value !== null && value !== undefined) {
    const tone = statusTone(value);
    return <span className={`badge ${TONE_BADGE[tone]}`}>{String(value)}</span>;
  }
  if (typeof value === 'number') return formatNumber(value);
  if (value === '' || value === null || value === undefined) return <span className="text-muted-light dark:text-muted-dark">—</span>;
  return String(value);
}
