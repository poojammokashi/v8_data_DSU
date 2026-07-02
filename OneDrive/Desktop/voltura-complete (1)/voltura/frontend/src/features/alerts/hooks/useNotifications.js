import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '@hooks/useFetch';
import { alertsApi } from '../api/alertsApi';

export function useNotifications({ severity, acknowledged, page = 1, pageSize = 20 } = {}) {
  const { data, isLoading, error, refetch, setData } = useFetch(
    () => alertsApi.listNotifications({ severity, acknowledged, page, pageSize }),
    [severity, acknowledged, page, pageSize]
  );

  const acknowledge = useCallback(
    async (id) => {
      await alertsApi.acknowledge(id);
      setData((prev) =>
        prev
          ? { ...prev, data: prev.data.map((n) => (n.id === id ? { ...n, acknowledged: true } : n)) }
          : prev
      );
    },
    [setData]
  );

  const acknowledgeAll = useCallback(async () => {
    await alertsApi.acknowledgeAll();
    setData((prev) => (prev ? { ...prev, data: prev.data.map((n) => ({ ...n, acknowledged: true })) } : prev));
  }, [setData]);

  return {
    notifications: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    acknowledge,
    acknowledgeAll,
  };
}

/**
 * Polls the unread count for the navbar bell badge. Interval-based rather
 * than websocket — simple, and sufficient for a dashboard refresh cadence.
 */
export function useUnreadNotificationCount(intervalMs = 60000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const { data } = await alertsApi.countUnacknowledged();
        if (!cancelled) setCount(data.count);
      } catch {
        // Silently ignore — the badge just won't update this cycle.
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return count;
}
