import { cn } from '@utils/cn';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-6',
        className
      )}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-2xl bg-surface-subtle flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-ink-faint" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-ink-muted max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
