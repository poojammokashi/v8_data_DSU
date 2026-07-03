import { SlidersHorizontal } from 'lucide-react';

export function FilterBar({ filterableColumns = [], records = [], filters, onChange }) {
  if (filterableColumns.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-xs font-medium text-muted-light dark:text-muted-dark">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </span>
      {filterableColumns.map((col) => {
        const options = Array.from(new Set(records.map((r) => r[col]).filter((v) => v !== '' && v !== undefined && v !== null))).sort();
        if (options.length < 2 || options.length > 20) return null;
        return (
          <select
            key={col}
            value={filters[col] || 'All'}
            onChange={(e) => onChange(col, e.target.value)}
            className="input w-auto py-1.5 text-xs"
          >
            <option value="All">{col}: All</option>
            {options.map((opt) => (
              <option key={String(opt)} value={opt}>
                {String(opt)}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}
