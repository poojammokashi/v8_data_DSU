import { HiOutlineBell } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import Dropdown, { DropdownDivider } from '@components/ui/Dropdown';
import Skeleton from '@components/ui/Skeleton';
import { useNotifications, useUnreadNotificationCount } from '@features/alerts/hooks/useNotifications';
import { formatRelativeTime } from '@utils/formatters';

const SEVERITY_DOT = { critical: 'bg-danger-500', warning: 'bg-warning-500', info: 'bg-info-500' };

export default function NotificationBell() {
  const navigate = useNavigate();
  const unreadCount = useUnreadNotificationCount();
  // Small preview list — refetches each time the dropdown's parent
  // re-renders, which is acceptable for a low-traffic preview panel.
  const { notifications, isLoading } = useNotifications({ acknowledged: false, pageSize: 4 });

  return (
    <Dropdown
      align="right"
      trigger={
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-subtle hover:text-ink transition-colors"
        >
          <HiOutlineBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-surface-raised" />
          )}
        </button>
      }
      className="w-80"
    >
      <div className="flex items-center justify-between px-3.5 py-2">
        <span className="text-sm font-semibold text-ink">Notifications</span>
        <span className="text-2xs text-ink-muted">{unreadCount} new</span>
      </div>
      <DropdownDivider />
      <div className="max-h-80 overflow-y-auto">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-3.5 py-2.5">
              <Skeleton className="h-3 w-3/4 mb-1.5" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
          ))}

        {!isLoading && notifications.length === 0 && (
          <p className="px-3.5 py-6 text-center text-xs text-ink-muted">You're all caught up.</p>
        )}

        {!isLoading &&
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate('/notifications')}
              className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left hover:bg-surface-subtle transition-colors"
            >
              <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${SEVERITY_DOT[n.rule?.severity] || 'bg-info-500'}`} />
              <span className="flex-1">
                <span className="block text-sm text-ink leading-snug">{n.title}</span>
                <span className="block text-2xs text-ink-faint mt-0.5">{formatRelativeTime(n.triggered_at)}</span>
              </span>
            </button>
          ))}
      </div>
      <DropdownDivider />
      <button
        onClick={() => navigate('/notifications')}
        className="block w-full px-3.5 py-2.5 text-center text-sm font-medium text-amber-500 hover:bg-surface-subtle transition-colors"
      >
        View all notifications
      </button>
    </Dropdown>
  );
}
