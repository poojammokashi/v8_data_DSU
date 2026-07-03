import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, RefreshCw, Search, X } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { SHEETS } from '../../config/sheetsConfig.js';

export function Header({ onOpenMobileNav }) {
  const { workbook, reload, status } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(query, 200);
  const containerRef = useRef(null);

  const results = useMemo(() => {
    if (!workbook || debounced.trim().length < 2) return [];
    const q = debounced.trim().toLowerCase();
    const hits = [];
    for (const sheetCfg of SHEETS) {
      const sheet = workbook.bySheet[sheetCfg.key];
      if (!sheet) continue;
      let count = 0;
      for (const section of sheet.sections) {
        for (const record of section.records) {
          if (Object.values(record).some((v) => String(v).toLowerCase().includes(q))) count += 1;
        }
      }
      if (count > 0 || sheetCfg.title.toLowerCase().includes(q)) {
        hits.push({ ...sheetCfg, count });
      }
    }
    return hits.slice(0, 8);
  }, [workbook, debounced]);

  const goTo = (route) => {
    navigate(`/module/${route}`);
    setQuery('');
    setFocused(false);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border-light dark:border-border-dark bg-panel-light/90 dark:bg-panel-dark/90 backdrop-blur px-4">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-light dark:text-muted-dark hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <h1 className="text-base font-bold tracking-tight text-ink-light dark:text-ink-dark">Decision Support Unit</h1>
      </div>

      <div ref={containerRef} className="relative ml-2 flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light dark:text-muted-dark" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search across all modules…"
          className="input pl-9 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-ink-light dark:hover:text-ink-dark"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {focused && debounced.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-xl border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark shadow-popover animate-fade-in">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-muted-light dark:text-muted-dark">No matches across modules.</p>
            ) : (
              results.map((r) => (
                <button
                  key={r.key}
                  onMouseDown={() => goTo(r.route)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="text-ink-light dark:text-ink-dark font-medium">{r.title}</span>
                  <span className="text-xs text-muted-light dark:text-muted-dark">{r.count} match{r.count === 1 ? '' : 'es'}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={reload}
        disabled={status === 'loading'}
        className="btn-secondary py-1.5"
        title="Reload workbook"
      >
        <RefreshCw className={`h-4 w-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      <ThemeToggle />
    </header>
  );
}
