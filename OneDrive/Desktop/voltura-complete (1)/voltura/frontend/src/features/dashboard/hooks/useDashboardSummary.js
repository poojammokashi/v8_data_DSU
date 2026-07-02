import { useFetch } from '@hooks/useFetch';
import { dashboardApi } from '../api/dashboardApi';

/**
 * Single hook powering DashboardOverviewPage — fetches the KPI summary,
 * combined trend, and source mix together since they all depend on the
 * same date range and the page renders all three at once.
 */
export function useDashboardSummary({ dateFrom, dateTo }) {
  const summary = useFetch(
    () => dashboardApi.getSummary({ dateFrom, dateTo }).then((r) => r.data),
    [dateFrom, dateTo]
  );

  const trend = useFetch(
    () => dashboardApi.getCombinedTrend({ dateFrom, dateTo }).then((r) => r.data),
    [dateFrom, dateTo]
  );

  const sourceMix = useFetch(
    () => dashboardApi.getSourceMix({ dateFrom, dateTo }).then((r) => r.data),
    [dateFrom, dateTo]
  );

  return {
    summary: summary.data,
    isSummaryLoading: summary.isLoading,
    summaryError: summary.error,

    trend: trend.data,
    isTrendLoading: trend.isLoading,
    trendError: trend.error,

    sourceMix: sourceMix.data,
    isSourceMixLoading: sourceMix.isLoading,
    sourceMixError: sourceMix.error,

    refetchAll: () => {
      summary.refetch();
      trend.refetch();
      sourceMix.refetch();
    },
  };
}
