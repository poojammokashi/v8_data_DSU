import { forwardRef } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { cn } from '@utils/cn';

const Checkbox = forwardRef(({ label, className, ...props }, ref) => {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}>
      <span className="relative inline-flex h-4.5 w-4.5 shrink-0">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span
          className={cn(
            'h-4.5 w-4.5 rounded-md border border-border bg-surface-raised flex items-center justify-center transition-colors',
            'peer-checked:bg-amber-500 peer-checked:border-amber-500',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400/40'
          )}
        >
          <HiCheck className="h-3 w-3 text-slate-950 opacity-0 peer-checked:opacity-100" />
        </span>
      </span>
      {label && <span className="text-sm text-ink">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
