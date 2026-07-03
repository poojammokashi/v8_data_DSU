export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      className={`animate-spin text-brand-600 dark:text-brand-400 ${className}`}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function FullScreenSpinner({ label = 'Loading Decision Support Unit…' }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm">
      <Spinner size={40} />
      <p className="text-sm font-medium text-muted-light dark:text-muted-dark">{label}</p>
    </div>
  );
}

export function OverlaySpinner({ label }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[998] flex justify-center pt-3 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark bg-panel-light dark:bg-panel-dark px-4 py-2 shadow-popover animate-fade-in">
        <Spinner size={16} />
        <span className="text-xs font-medium text-muted-light dark:text-muted-dark">{label}</span>
      </div>
    </div>
  );
}
