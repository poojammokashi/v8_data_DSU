import { forwardRef } from 'react';
import { HiChevronDown } from 'react-icons/hi2';
import { cn } from '@utils/cn';

const Select = forwardRef(
  ({ label, error, hint, options = [], placeholder, className, containerClassName, id, required, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-ink mb-1.5">
            {label}
            {required && <span className="text-danger-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              'w-full h-10 rounded-xl border bg-surface-raised pl-3.5 pr-9 text-sm text-ink appearance-none',
              'transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400',
              error ? 'border-danger-500' : 'border-border hover:border-ink-faint',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
