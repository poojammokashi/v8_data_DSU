import { HiOutlineCalendar } from 'react-icons/hi2';

export default function DateRangePicker({ from, to, onFromChange, onToChange, className }) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <div className="relative">
        <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="h-10 rounded-xl border border-border bg-surface-raised pl-9 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
        />
      </div>
      <span className="text-ink-faint text-sm">to</span>
      <div className="relative">
        <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="h-10 rounded-xl border border-border bg-surface-raised pl-9 pr-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
        />
      </div>
    </div>
  );
}
