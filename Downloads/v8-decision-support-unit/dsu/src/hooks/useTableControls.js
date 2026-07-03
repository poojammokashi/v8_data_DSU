import { useMemo, useState } from 'react';
import { useDebounce } from './useDebounce.js';

const PAGE_SIZE = 8;

export function useTableControls(records = [], headers = []) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 200);

  const filtered = useMemo(() => {
    let rows = records;

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      rows = rows.filter((r) => headers.some((h) => String(r[h] ?? '').toLowerCase().includes(q)));
    }

    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== 'All') {
        rows = rows.filter((r) => String(r[key]) === String(val));
      }
    });

    if (sort.key) {
      rows = [...rows].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (typeof av === 'number' && typeof bv === 'number') {
          return sort.dir === 'asc' ? av - bv : bv - av;
        }
        return sort.dir === 'asc'
          ? String(av ?? '').localeCompare(String(bv ?? ''))
          : String(bv ?? '').localeCompare(String(av ?? ''));
      });
    }

    return rows;
  }, [records, headers, debouncedSearch, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  };

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return {
    search,
    setSearch: (v) => {
      setSearch(v);
      setPage(1);
    },
    filters,
    updateFilter,
    sort,
    toggleSort,
    page: clampedPage,
    setPage,
    totalPages,
    pageRows,
    filteredCount: filtered.length,
    filteredRows: filtered
  };
}
