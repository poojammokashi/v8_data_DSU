import { useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineBellSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Tabs from '@components/ui/Tabs';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import EmptyState from '@components/ui/EmptyState';
import Skeleton from '@components/ui/Skeleton';
import ErrorState from '@components/feedback/ErrorState';
import { useNotifications } from '@features/alerts/hooks/useNotifications';
import { formatDateTime } from '@utils/formatters';

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

const SEVERITY_CONFIG = {
  critical: { badge: 'danger', label: 'Critical' },
  warning: { badge: 'warning', label: 'Warning' },
  info: { badge: 'info', label: 'Info' },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const { notifications, isLoading, error, refetch, acknowledge, acknowledgeAll } = useNotifications({
    severity: filter === 'all' ? undefined : filter,
    pageSize: 50,
  });

  const unreadCount = notifications.filter((n) => !n.acknowledged).length;

  async function handleAcknowledge(id) {
    try {
      await acknowledge(id);
      toast.success('Notification acknowledged');
    } catch (err) {
      toast.error(err.message || 'Failed to acknowledge notification');
    }
  }

  async function handleAcknowledgeAll() {
    try {
      await acknowledgeAll();
      toast.success('All notifications acknowledged');
    } catch (err) {
      toast.error(err.message || 'Failed to acknowledge notifications');
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Notifications</h1>
          <p className="text-sm text-ink-muted mt-1">
            {unreadCount > 0 ? `${unreadCount} unacknowledged alerts` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" leftIcon={HiOutlineCheckCircle} onClick={handleAcknowledgeAll}>
            Acknowledge all
          </Button>
        )}
      </div>

      <Tabs tabs={FILTER_TABS} activeTab={filter} onChange={setFilter} />

      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}

        {!isLoading && error && (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised">
            <ErrorState title="Couldn't load notifications" description={error.message} onRetry={refetch} />
          </div>
        )}

        {!isLoading && !error && notifications.length === 0 && (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised">
            <EmptyState
              icon={HiOutlineBellSlash}
              title="No notifications here"
              description="You're all caught up for this filter."
            />
          </div>
        )}

        {!isLoading &&
          !error &&
          notifications.map((alert) => {
            const config = SEVERITY_CONFIG[alert.rule?.severity] || SEVERITY_CONFIG.info;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors ${
                  alert.acknowledged
                    ? 'border-border-subtle bg-surface-raised'
                    : 'border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5'
                }`}
              >
                <Badge variant={config.badge} dot className="mt-0.5 shrink-0">
                  {config.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-snug">{alert.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-2xs text-ink-faint">{alert.rule?.name}</span>
                    <span className="text-ink-faint">·</span>
                    <span className="text-2xs text-ink-faint">{formatDateTime(alert.triggered_at)}</span>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <Button variant="ghost" size="sm" onClick={() => handleAcknowledge(alert.id)} className="shrink-0">
                    Acknowledge
                  </Button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
