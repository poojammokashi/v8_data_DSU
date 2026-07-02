import { HiArrowUp, HiArrowDown, HiMinus } from 'react-icons/hi2';
import { cn } from '@utils/cn';

export default function TrendIndicator({ value, suffix = '%', className }) {
  if (value === null || value === undefined) {
    return <span className={cn('text-ink-faint text-xs', className)}>—</span>;
  }

  const isFlat = Math.abs(value) < 0.05;
  const isPositive = value > 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium tabular',
        isFlat ? 'text-ink-faint' : isPositive ? 'text-success-500' : 'text-danger-500',
        className
      )}
    >
      {isFlat ? (
        <HiMinus className="h-3 w-3" />
      ) : isPositive ? (
        <HiArrowUp className="h-3 w-3" />
      ) : (
        <HiArrowDown className="h-3 w-3" />
      )}
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
