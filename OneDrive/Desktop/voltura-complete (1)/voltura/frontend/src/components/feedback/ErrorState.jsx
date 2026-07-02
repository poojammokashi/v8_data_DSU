import { HiOutlineWifi } from 'react-icons/hi2';
import Button from '@components/ui/Button';

export default function ErrorState({
  title = "Couldn't load this data",
  description = 'Check your connection and try again.',
  onRetry,
  className,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className || ''}`}>
      <div className="h-12 w-12 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
        <HiOutlineWifi className="h-6 w-6 text-ink-faint" />
      </div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-muted max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
