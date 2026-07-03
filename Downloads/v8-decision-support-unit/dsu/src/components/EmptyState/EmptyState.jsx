import { Inbox, SearchX, AlertCircle } from 'lucide-react';

const ICONS = {
  empty: Inbox,
  search: SearchX,
  error: AlertCircle
};

export function EmptyState({ variant = 'empty', title = 'Nothing here yet', description, action }) {
  const Icon = ICONS[variant] || Inbox;
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-light dark:border-border-dark px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-muted-light dark:text-muted-dark" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-light dark:text-muted-dark">{description}</p>}
      {action}
    </div>
  );
}
