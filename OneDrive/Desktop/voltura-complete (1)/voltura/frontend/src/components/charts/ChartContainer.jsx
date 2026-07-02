import Skeleton from '@components/ui/Skeleton';
import EmptyState from '@components/ui/EmptyState';
import { HiOutlineChartBarSquare } from 'react-icons/hi2';
import { cn } from '@utils/cn';

export default function ChartContainer({
  title,
  description,
  actions,
  isLoading,
  isEmpty,
  height = 320,
  children,
  className,
}) {
  return (
    <div className={cn('rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-card', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
            {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="w-full" style={{ height }} />
      ) : isEmpty ? (
        <div style={{ height }} className="flex items-center justify-center">
          <EmptyState
            icon={HiOutlineChartBarSquare}
            title="No data for this period"
            description="Try a different date range."
          />
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </div>
  );
}
