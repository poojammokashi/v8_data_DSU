import { cn } from '@utils/cn';

export default function Switch({ checked, onChange, label, description, disabled, className }) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-4 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium text-ink">{label}</span>}
          {description && <span className="text-xs text-ink-muted mt-0.5">{description}</span>}
        </span>
      )}
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange?.(!checked)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            onChange?.(!checked);
          }
        }}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-amber-500' : 'bg-border'
        )}
      >
        <span
          className={cn(
            'inline-block h-4.5 w-4.5 rounded-full bg-white shadow-soft transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          )}
        />
      </span>
    </label>
  );
}
