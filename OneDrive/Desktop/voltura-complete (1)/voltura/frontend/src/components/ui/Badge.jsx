import { cn } from '@utils/cn';

const VARIANTS = {
  neutral: 'bg-surface-subtle text-ink-muted border-border-subtle',
  success: 'bg-success-50 text-success-700 border-success-500/20 dark:bg-success-500/10 dark:text-success-500',
  danger: 'bg-danger-50 text-danger-700 border-danger-500/20 dark:bg-danger-500/10 dark:text-danger-500',
  warning: 'bg-warning-50 text-warning-600 border-warning-500/20 dark:bg-warning-500/10 dark:text-warning-500',
  info: 'bg-info-50 text-info-600 border-info-500/20 dark:bg-info-500/10 dark:text-info-500',
  amber: 'bg-amber-50 text-amber-700 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  teal: 'bg-teal-50 text-teal-700 border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400',
};

const DOT_COLORS = {
  neutral: 'bg-ink-faint',
  success: 'bg-success-500',
  danger: 'bg-danger-500',
  warning: 'bg-warning-500',
  info: 'bg-info-500',
  amber: 'bg-amber-500',
  teal: 'bg-teal-500',
};

export default function Badge({ variant = 'neutral', dot = false, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium leading-none',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_COLORS[variant])} />}
      {children}
    </span>
  );
}
